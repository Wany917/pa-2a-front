"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { User, ChevronDown, Edit, LogOut, Send, Search, Phone, Video, Info, ArrowLeft } from "lucide-react"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"
import { io, Socket } from "socket.io-client"

// Types for our data
interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  isRead: boolean
  isFromUser: boolean
}

interface Conversation {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  recipientType: "delivery" | "service";
  serviceType?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  status: "online" | "offline" | "away";
}

export default function MessagesPage() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [first_name, setUserName] = useState("")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "delivery" | "service">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [availableUsers, setAvailableUsers] = useState<{id: number, name: string}[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<number | null>(null)
  const [typingUsers, setTypingUsers] = useState<{[key: string]: {typing: boolean, timeout: NodeJS.Timeout | null}}>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const lastTypingTime = useRef<number>(0)
  const typingTimeoutRef = useRef<{[key: string]: NodeJS.Timeout | null}>({})

  const { t } = useLanguage()

  useEffect(() => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
    if (!token) return
    
    // Récupérer l'ID utilisateur
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      credentials: 'include'
    })
    .then(res => {
      if (!res.ok) throw new Error('Unauthorized')
      return res.json()
    })
    .then(data => {
      setUserName(data.firstName)
      setUserId(data.id)
      
      // Initialiser WebSocket après avoir récupéré l'ID
      const socketIo = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
        query: { user_id: data.id.toString() },
        auth: { userId: data.id.toString() },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      })
      
      setSocket(socketIo)
      
      // Événements WebSocket
      socketIo.on('connect', () => {
        console.log('Connected to WebSocket')
        // Authentification explicite après connexion
        socketIo.emit('authenticate', { userId: data.id })
      })
      
      socketIo.on('new_message', (message) => {
        console.log('Nouveau message reçu via WebSocket:', message)
        // Mettre à jour la conversation avec le nouveau message
        handleNewMessage(message)
        
        // Effacer l'indicateur de frappe lorsqu'un message est reçu
        if (message.senderId) {
          clearTypingIndicator(message.senderId.toString())
        }
      })
      
      // Écouter aussi les confirmations de messages envoyés
      socketIo.on('message_sent', (message) => {
        console.log('Message envoyé confirmé via WebSocket:', message)
        handleNewMessage(message)
      })
      
      // Écouter les indicateurs de frappe
      socketIo.on('user_typing', (data) => {
        console.log('Utilisateur en train d\'écrire:', data)
        if (data.userId) {
          // Ajouter l'utilisateur à la liste des utilisateurs en train d'écrire
          setTypingUsers(prev => {
            // Effacer tout timeout existant
            if (prev[data.userId]?.timeout) {
              clearTimeout(prev[data.userId].timeout)
            }
            
            // Créer un nouveau timeout qui supprimera l'indicateur après 3 secondes
            const timeout = setTimeout(() => {
              setTypingUsers(prevTyping => ({
                ...prevTyping,
                [data.userId]: { typing: false, timeout: null }
              }))
            }, 3000)
            
            return {
              ...prev,
              [data.userId]: { typing: true, timeout }
            }
          })
        }
      })
      
      // Écouter les notifications de lecture
      socketIo.on('message_read', (data) => {
        console.log('Message marqué comme lu:', data)
        if (data.messageId) {
          // Mettre à jour le statut du message dans l'interface
          setConversations(prevConversations => 
            prevConversations.map(conversation => ({
              ...conversation,
              messages: conversation.messages.map(msg => 
                msg.id === data.messageId ? { ...msg, isRead: true } : msg
              )
            }))
          )
        }
      })
      
      socketIo.on('user_status_change', (data) => {
        // Mettre à jour le statut de l'utilisateur
        updateUserStatus(data.userId, data.status)
      })
      
      socketIo.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
      })
      
      socketIo.on('error', (error) => {
        console.error('WebSocket error:', error)
      })
      
      // Récupérer les conversations
      loadConversations(data.id, token)
    })
    .catch(err => console.error('Auth/me failed:', err))
    
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])
  
  // Charger les conversations depuis l'API
  const loadConversations = (userId: number, token: string) => {
    console.log('Chargement des conversations...')
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/inbox`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`)
      }
      return res.json()
    })
    .then(data => {
      // Transformer les données de l'API en format attendu par le composant
      const formattedConversations = formatConversations(data.messages, userId)
      
      // Trier les conversations par date du dernier message (du plus récent au plus ancien)
      formattedConversations.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      )
      
      setConversations(formattedConversations)
      console.log('Conversations chargées avec succès')
    })
    .catch(err => {
      console.error('Failed to load conversations:', err)
      // Si le token est expiré, rediriger vers la page de connexion
      if (err.message.includes('401')) {
        window.location.href = '/login'
      }
    })
  }
  
  // Formater les données depuis le format API vers le format du composant
  const formatConversations = (messages: any[], currentUserId: number) => {
    // Grouper les messages par conversation
    const conversationMap = new Map()
    
    messages.forEach(msg => {
      const otherUserId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId
      const otherUser = msg.senderId === currentUserId ? msg.receiver : msg.sender
      
      if (!conversationMap.has(otherUserId)) {
        // Utiliser des valeurs par défaut si les données sont undefined
        const firstName = otherUser?.first_name || otherUser?.firstName || 'Utilisateur'
        const lastName = otherUser?.last_name || otherUser?.lastName || `#${otherUserId}`
        
        conversationMap.set(otherUserId, {
          id: `conv_${currentUserId}_${otherUserId}`,
          recipientId: otherUserId.toString(),
          recipientName: `${firstName} ${lastName}`.trim(),
          recipientAvatar: "/placeholder.svg?height=40&width=40", // À remplacer par l'avatar réel
          recipientType: determineUserType(otherUser),
          lastMessage: msg.content || "",
          lastMessageTime: msg.createdAt || new Date().toISOString(),
          unreadCount: 0, // Initialiser à 0 et calculer correctement plus tard
          messages: [],
          status: "offline" // Par défaut, sera mis à jour avec les statuts WebSocket
        })
      }
      
      const conversation = conversationMap.get(otherUserId)
      
      // Nom d'expéditeur par défaut si undefined
      const senderFirstName = msg.senderId === currentUserId ? "Vous" : (otherUser?.first_name || otherUser?.firstName || 'Utilisateur')
      const senderLastName = msg.senderId === currentUserId ? "" : (otherUser?.last_name || otherUser?.lastName || "")
      const senderName = msg.senderId === currentUserId ? "Vous" : `${senderFirstName} ${senderLastName}`.trim()
      
      // Ajouter le message à la conversation
      conversation.messages.push({
        id: msg.id?.toString() || `temp_${Date.now()}`,
        senderId: msg.senderId?.toString() || "",
        senderName: senderName,
        content: msg.content || "",
        timestamp: msg.createdAt || new Date().toISOString(),
        isRead: msg.isRead || false,
        isFromUser: msg.senderId === currentUserId
      })
      
      // Mettre à jour le dernier message si plus récent
      if (new Date(msg.createdAt || 0) > new Date(conversation.lastMessageTime || 0)) {
        conversation.lastMessage = msg.content || ""
        conversation.lastMessageTime = msg.createdAt || new Date().toISOString()
      }
      
      // Compter les messages non lus UNIQUEMENT si l'expéditeur est l'autre personne
      if (msg.senderId !== currentUserId && !msg.isRead) {
        conversation.unreadCount++
      }
    })
    
    // Pour chaque conversation, trier les messages du plus ancien au plus récent
    const result = Array.from(conversationMap.values())
    result.forEach(conversation => {
      conversation.messages.sort((a: any, b: any) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    })
    
    return result
  }
  
  // Déterminer le type d'utilisateur
  const determineUserType = (user: any) => {
    if (user.livreur) return "delivery"
    if (user.prestataire) return "service"
    return "delivery" // Par défaut
  }

  // Fonction pour effacer l'indicateur de frappe
  const clearTypingIndicator = (userId: string) => {
    setTypingUsers(prev => {
      const newState = { ...prev }
      // Effacer le timeout s'il existe
      if (newState[userId]?.timeout) {
        clearTimeout(newState[userId].timeout)
      }
      // Supprimer l'entrée pour cet utilisateur
      delete newState[userId]
      return newState
    })
  }

  // Gérer l'envoi d'un nouveau message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !socket || !userId) return
    
    const currentConv = conversations.find(c => c.id === selectedConversation)
    if (!currentConv) return
    
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
    
    // Arrêter l'indicateur de frappe lorsqu'un message est envoyé
    clearTypingIndicator(userId.toString())
    socket.emit('typing', { 
      receiverId: parseInt(currentConv.recipientId),
      typing: false 
    })
    
    // Générer un ID temporaire unique pour ce message
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    // Stocker temporairement le message en local pour affichage immédiat
    const tempMessage = {
      id: tempId,
      senderId: userId.toString(),
      senderName: "Vous",
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false, // Initialiser comme non lu
      isFromUser: true,
      isPending: true // Marquer comme en attente de confirmation
    }
    
    // Mettre à jour l'interface utilisateur immédiatement
    setConversations(prevConversations => 
      prevConversations.map(conversation => {
        if (conversation.id === selectedConversation) {
          // Ajouter le message à la liste des messages et trier par date (du plus ancien au plus récent)
          const updatedMessages = [...conversation.messages, tempMessage].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          
          return {
            ...conversation,
            lastMessage: newMessage,
            lastMessageTime: new Date().toISOString(),
            messages: updatedMessages
          }
        }
        return conversation
      })
    )
    
    // S'assurer que la connexion WebSocket est active
    ensureWebSocketConnection(userId)
    
    // Pour éviter les doublons, n'utiliser qu'un seul canal d'envoi
    // Privilégier l'API REST pour garantir la persistance, puis le WebSocket notifiera
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        senderId: userId,
        receiverId: parseInt(currentConv.recipientId),
        content: newMessage,
        tempId: tempId // Envoyer l'ID temporaire pour pouvoir remplacer le message temporaire
      })
    })
    .then(res => {
      if (!res.ok) {
        console.error('Failed to send message via API:', res.status)
        // Marquer le message comme échoué
        setConversations(prevConversations => 
          prevConversations.map(conversation => {
            if (conversation.id === selectedConversation) {
              return {
                ...conversation,
                messages: conversation.messages.map(msg => 
                  msg.id === tempId 
                    ? {...msg, failed: true, isPending: false} 
                    : msg
                )
              }
            }
            return conversation
          })
        )
        throw new Error('Failed to send message')
      }
      return res.json()
    })
    .catch(err => {
      console.error('Failed to send message:', err)
      alert("Le message n'a pas pu être envoyé. Veuillez réessayer.")
    })
    
    setNewMessage("")
    
    // Mettre le focus sur le champ d'input après l'envoi
    if (messageInputRef.current) {
      messageInputRef.current.focus()
    }
  }
  
  // Gérer la frappe de l'utilisateur pour envoyer les indicateurs "en train d'écrire"
  const handleTyping = () => {
    if (!selectedConversation || !socket || !userId) return
    
    const currentConv = conversations.find(c => c.id === selectedConversation)
    if (!currentConv) return
    
    const currentTime = Date.now()
    
    // Envoyer l'indicateur de frappe au maximum toutes les 3 secondes
    if (currentTime - lastTypingTime.current > 3000) {
      lastTypingTime.current = currentTime
      socket.emit('typing', { 
        receiverId: parseInt(currentConv.recipientId),
        typing: true 
      })
      
      // Arrêter l'indicateur après 3 secondes d'inactivité
      if (typingTimeoutRef.current[currentConv.recipientId]) {
        clearTimeout(typingTimeoutRef.current[currentConv.recipientId])
      }
      
      typingTimeoutRef.current[currentConv.recipientId] = setTimeout(() => {
        socket.emit('typing', { 
          receiverId: parseInt(currentConv.recipientId),
          typing: false 
        })
      }, 3000)
    }
  }

  // Marquer un message comme lu lorsqu'une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation && userId) {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
      const currentConv = conversations.find(c => c.id === selectedConversation)
      
      if (!currentConv) return
      
      // Marquer tous les messages de la conversation sélectionnée comme lus
      setConversations(prevConversations => 
        prevConversations.map(conversation => {
          if (conversation.id === selectedConversation) {
            // Mettre à jour les messages pour les marquer comme lus
            const updatedMessages = conversation.messages.map(message => ({
              ...message,
              isRead: true
            }))
            
            // Réinitialiser le compteur de messages non lus
            return {
              ...conversation,
              unreadCount: 0,
              messages: updatedMessages
            }
          }
          return conversation
        })
      )
      
      // Envoyer des notifications au serveur pour marquer les messages comme lus
      if (currentConv && userId) {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
        if (!token) return
        
        // Identifier les messages non lus envoyés par l'autre utilisateur
        const unreadMessages = currentConv.messages.filter(
          m => !m.isRead && m.senderId === currentConv.recipientId
        )
        
        // Marquer chaque message comme lu
        unreadMessages.forEach(msg => {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${msg.id}/read`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }).catch(err => console.error('Failed to mark message as read:', err))
        })
      }
    }
  }, [selectedConversation, userId])
  
  // Gérer un nouveau message entrant
  const handleNewMessage = (message: any) => {
    console.log('Traitement du nouveau message:', message)
    
    const senderId = message.senderId.toString()
    const receiverId = message.receiverId.toString()
    const tempId = message.tempId // Récupérer l'ID temporaire si présent
    
    // Déterminer si ce message concerne l'utilisateur actuel
    if (senderId !== userId?.toString() && receiverId !== userId?.toString()) {
      console.log('Message non destiné à cet utilisateur, ignoré')
      return
    }
    
    // Déterminer l'ID de l'autre personne
    const otherPersonId = senderId === userId?.toString() ? receiverId : senderId
    
    // Vérifier si nous avons déjà une conversation avec cette personne
    const existingConvIndex = conversations.findIndex(c => c.recipientId === otherPersonId)
    
    if (existingConvIndex >= 0) {
      setConversations(prevConversations => {
        const updatedConversations = [...prevConversations]
        const conversation = updatedConversations[existingConvIndex]
        
        // Créer un format de message compatible avec l'interface
        const newMsg = {
          id: message.id || `msg_${Date.now()}`,
          senderId: senderId,
          senderName: senderId === userId?.toString() ? "Vous" : conversation.recipientName,
          content: message.content,
          timestamp: message.timestamp || message.createdAt || new Date().toISOString(),
          isRead: selectedConversation === conversation.id || senderId === userId?.toString(),
          isFromUser: senderId === userId?.toString(),
          isPending: false
        }
        
        // Si c'est une confirmation d'un message temporaire, remplacer le message temporaire
        if (tempId && conversation.messages.some(m => m.id === tempId)) {
          const updatedMessages = conversation.messages.map(m => 
            m.id === tempId ? newMsg : m
          )
          
          // Trier les messages par date (du plus ancien au plus récent)
          const sortedMessages = updatedMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          
          conversation.messages = sortedMessages
          conversation.lastMessage = message.content
          conversation.lastMessageTime = message.timestamp || message.createdAt || new Date().toISOString()
          
          // N'incrémenter le compteur que si:
          // 1. La conversation n'est pas sélectionnée actuellement
          // 2. ET le message provient de l'autre personne (pas de l'utilisateur actuel)
          // 3. ET le message n'est pas marqué comme lu
          if (selectedConversation !== conversation.id && 
              senderId !== userId?.toString() && 
              !newMsg.isRead) {
            conversation.unreadCount++
          }
        }
        
        return updatedConversations
      })
    } else {
      // Nous devons charger les détails de l'utilisateur et créer une nouvelle conversation
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
      if (token && userId) {
        loadConversations(userId, token)
      }
    }
  }
  
  // Mettre à jour le statut d'un utilisateur
  const updateUserStatus = (userId: number, status: string) => {
    setConversations(prevConversations =>
      prevConversations.map(conversation => {
        if (conversation.recipientId === userId.toString()) {
          return {
            ...conversation,
            status: status as "online" | "offline" | "away"
          }
        }
        return conversation
      })
    )
  }

  // Filter conversations based on active tab and search query
  const filteredConversations = conversations.filter((conversation) => {
    // Filter by type
    if (activeTab === "delivery" && conversation.recipientType !== "delivery") return false
    if (activeTab === "service" && conversation.recipientType !== "service") return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        conversation.recipientName.toLowerCase().includes(query) ||
        (conversation.serviceType && conversation.serviceType.toLowerCase().includes(query))
      )
    }

    return true
  })

  // Get the selected conversation
  const currentConversation = conversations.find((c) => c.id === selectedConversation)

  // Scroll to bottom of messages when a new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentConversation?.messages])

  // Format date for display
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    // Check if date is today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // Check if date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }

    // Otherwise return full date
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status indicator color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      default:
        return "bg-gray-400"
    }
  }

  // Ajouter ce useEffect pour charger les utilisateurs disponibles quand le modal s'ouvre
  useEffect(() => {
    if (showNewChatModal) {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
      if (!token) return
      
      // Récupérer les utilisateurs disponibles
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/available-users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setAvailableUsers(data.users || [])
      })
      .catch(err => console.error('Failed to load available users:', err))
    }
  }, [showNewChatModal])

  // Ajouter la fonction pour démarrer une nouvelle conversation
  const handleStartNewConversation = () => {
    if (!selectedRecipient || !userId) {
      return
    }
    
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
    if (!token) return
    
    // Envoyer un premier message vide ou un message de bienvenue
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        senderId: userId,
        receiverId: selectedRecipient,
        content: t("messages.conversationStarted")
      })
    })
    .then(res => res.json())
    .then(() => {
      // Recharger les conversations
      loadConversations(userId, token)
      
      // Fermer le modal
      setShowNewChatModal(false)
      setSelectedRecipient(null)
    })
    .catch(err => console.error('Failed to start conversation:', err))
  }

  // Ajouter cette fonction pour vérifier et rétablir la connexion WebSocket
  const ensureWebSocketConnection = (userId: number) => {
    if (!socket || !socket.connected) {
      console.log('Tentative de reconnecter le WebSocket...')
      const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
        query: { user_id: userId.toString() },
        auth: { userId: userId.toString() },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      })
      
      newSocket.on('connect', () => {
        console.log('WebSocket reconnecté avec succès')
        newSocket.emit('authenticate', { userId })
      })
      
      newSocket.on('connect_error', (error) => {
        console.error('Erreur de reconnexion WebSocket:', error)
      })
      
      setSocket(newSocket)
      return newSocket
    }
    return socket
  }

  // Fonction pour rafraîchir immédiatement les conversations
  const refreshConversations = () => {
    if (!userId) return
    
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
    if (!token) return
    
    ensureWebSocketConnection(userId)
    loadConversations(userId, token)
  }

  // Fonction pour rafraîchir périodiquement les conversations
  useEffect(() => {
    if (!userId) return
    
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
    if (!token) return
    
    // Rafraîchir les conversations immédiatement une fois
    refreshConversations()
    
    // Vérifier la connexion WebSocket périodiquement
    const wsCheckInterval = setInterval(() => {
      ensureWebSocketConnection(userId)
    }, 10000)  // Vérifier toutes les 10 secondes
    
    // Rafraîchir les conversations toutes les 15 secondes pour récupérer les messages manqués
    const intervalId = setInterval(() => {
      refreshConversations()
    }, 15000) // Réduit de 30s à 15s pour une mise à jour plus fréquente
    
    return () => {
      clearInterval(intervalId)
      clearInterval(wsCheckInterval)
    }
  }, [userId])

  // Ajouter un effet pour surveiller les changements de focus de la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      console.log('Fenêtre a regagné le focus, rafraîchissement des conversations')
      if (userId) {
        refreshConversations()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [userId])

  // Ajouter un effet pour faire défiler automatiquement vers le dernier message
  useEffect(() => {
    if (selectedConversation) {
      // Trouver l'élément du conteneur de messages
      const messagesContainer = document.querySelector('.messages-container')
      if (messagesContainer) {
        // Faire défiler vers le bas pour voir les messages les plus récents
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }
    }
  }, [selectedConversation, conversations])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/app_client">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-NEF7Y3VVan4gaPKz0Ke4Q9FTKCgie4.png"
                alt="EcoDeli Logo"
                width={120}
                height={40}
                className="h-auto"
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/app_client/announcements" className="text-gray-700 hover:text-green-500">
              {t("navigation.myAnnouncements")}
            </Link>
            <Link href="/app_client/payments" className="text-gray-700 hover:text-green-500">
              {t("navigation.myPayments")}
            </Link>
            <Link href="/app_client/messages" className="text-green-500 font-medium border-b-2 border-green-500">
              {t("navigation.messages")}
            </Link>
            <Link href="/app_client/complaint" className="text-gray-700 hover:text-green-500">
              {t("navigation.makeComplaint")}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSelector />

            {/* User Account Menu */}
            <div className="relative">
              <button
                className="flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">{first_name}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100">
                  <Link
                    href="/app_client/edit-account"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span>{t("common.editAccount")}</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <div className="px-4 py-1 text-xs text-gray-500">{t("common.registerAs")}</div>

                  <Link href="/register/delivery-man" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.deliveryMan")}
                  </Link>

                  <Link href="/register/shopkeeper" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.shopkeeper")}
                  </Link>

                  <Link href="/register/service-provider" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.serviceProvider")}
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <Link href="/logout" className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>{t("common.logout")}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-center text-green-400 mb-8">
          {t("messages.yourMessages")}
        </h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row h-[calc(80vh-100px)]">
            {/* Conversations List */}
            <div
              className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${selectedConversation ? "hidden md:flex" : "flex"}`}
            >
              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder={t("messages.searchConversations")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>

                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`flex-1 px-4 py-2 text-sm rounded-md ${
                      activeTab === "all" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                    }`}
                  >
                    {t("common.all")}
                  </button>
                  <button
                    onClick={() => setActiveTab("delivery")}
                    className={`flex-1 px-4 py-2 text-sm rounded-md ${
                      activeTab === "delivery" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                    }`}
                  >
                    {t("messages.delivery")}
                  </button>
                  <button
                    onClick={() => setActiveTab("service")}
                    className={`flex-1 px-4 py-2 text-sm rounded-md ${
                      activeTab === "service" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                    }`}
                  >
                    {t("messages.services")}
                  </button>
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="ml-2 bg-green-500 text-white h-9 w-9 rounded-full flex items-center justify-center hover:bg-green-600 focus:outline-none"
                    title={t("messages.newConversation")}
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation === conversation.id ? "bg-gray-50" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start">
                        <div className="relative mr-3 flex-shrink-0">
                          <Image
                            src={conversation.recipientAvatar || "/placeholder.svg"}
                            alt={conversation.recipientName}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversation.status)}`}
                          ></span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium truncate">{conversation.recipientName}</h3>
                            <span className="text-xs text-gray-500">
                              {formatMessageDate(conversation.lastMessageTime).split(",")[0]}
                            </span>
                          </div>
                          {conversation.serviceType && (
                            <p className="text-xs text-green-500 mb-1">{conversation.serviceType}</p>
                          )}
                          {/* Afficher l'indicateur "en train d'écrire" */}
                          {typingUsers[conversation.recipientId]?.typing ? (
                            <p className="text-sm italic text-gray-600">
                              {t("messages.isTyping")}...
                            </p>
                          ) : (
                            <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                          )}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="ml-2 bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">{t("messages.noConversations")}</div>
                )}
              </div>
            </div>

            {/* Conversation Detail */}
            <div className={`w-full md:w-2/3 flex flex-col ${!selectedConversation ? "hidden md:flex" : "flex"}`}>
              {!currentConversation ? (
                <div className="flex-1 flex items-center justify-center p-4 text-gray-500">
                  <div className="text-center">
                    <div className="mb-4">
                      <Image
                        src="/placeholder.svg?height=100&width=100"
                        alt={t("messages.selectConversation")}
                        width={100}
                        height={100}
                        className="mx-auto opacity-50"
                      />
                    </div>
                    <p>{t("messages.selectConversation")}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center">
                    <button className="md:hidden mr-2 text-gray-500" onClick={() => setSelectedConversation(null)}>
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="relative mr-3">
                      <Image
                        src={currentConversation.recipientAvatar || "/placeholder.svg"}
                        alt={currentConversation.recipientName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(currentConversation.status)}`}
                      ></span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{currentConversation.recipientName}</h3>
                      <p className="text-xs text-gray-500">
                        {/* Afficher l'indicateur de frappe */}
                        {typingUsers[currentConversation.recipientId]?.typing 
                           ? t("messages.isTyping") + "..."
                           : currentConversation.status === "online"
                             ? t("messages.online")
                             : currentConversation.status === "away"
                               ? t("messages.away")
                               : t("messages.offline")
                        }
                      </p>
                    </div>
                  </div>

                  {/* Messages - Ajouter une classe pour identifier le conteneur des messages */}
                  <div className="flex-1 p-4 overflow-y-auto messages-container">
                    <div className="space-y-4">
                      {currentConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isFromUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-4 py-2 ${
                              message.isFromUser
                                ? "bg-green-100 text-gray-800"
                                : "bg-white border border-gray-200 text-gray-800"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-sm">{message.senderName}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                {formatMessageDate(message.timestamp).split(",")[1] ||
                                  formatMessageDate(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                            
                            {/* Indicateur de message envoyé/lu */}
                            {message.isFromUser && (
                              <div className="text-right mt-1">
                                {message.isPending ? (
                                  <span className="text-xs text-gray-400">
                                    {t("messages.sending")}...
                                  </span>
                                ) : message.failed ? (
                                  <span className="text-xs text-red-500">
                                    {t("messages.failed")}
                                  </span>
                                ) : message.isRead ? (
                                  <span className="text-xs text-green-500">
                                    {t("messages.read")}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    {t("messages.sent")}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder={t("messages.typeMessage")}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        onKeyDown={handleTyping}
                        ref={messageInputRef}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal pour nouvelle conversation */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">{t("messages.startNewConversation")}</h3>
            
            {/* Formulaire pour sélectionner un destinataire */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("messages.selectRecipient")}
              </label>
              <select 
                className="w-full border border-gray-300 rounded-md p-2"
                value={selectedRecipient || ""}
                onChange={(e) => setSelectedRecipient(Number(e.target.value))}
              >
                <option value="">-- {t("messages.selectUser")} --</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowNewChatModal(false)
                  setSelectedRecipient(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleStartNewConversation}
                disabled={!selectedRecipient}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {t("common.start")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}