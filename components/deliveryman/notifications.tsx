"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import DeliverymanLayout from "./layout"
import { Package, Bell, BellOff, Check, CheckCheck, Clock, MapPin, Euro, Calendar, AlertTriangle, RefreshCw } from "lucide-react"
import { useApiCall } from "@/hooks/use-api-call"
import { useLivreurWebSocket } from "@/hooks/use-livreur-websocket"
import { livreurService } from "@/services/livreurService"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/app/auth-context"
import { useLanguage } from "@/components/language-context"
import type { Livraison } from "@/types/api"

// Interface pour les notifications basées sur les livraisons
interface DeliveryNotification {
  id: number
  type: 'new_delivery' | 'status_update' | 'cancelled'
  title: string
  description: string
  productName?: string
  image?: string
  clientName?: string
  pickupAddress?: string
  deliveryAddress?: string
  price?: number
  deliveryDate?: string
  size?: string
  urgent: boolean
  isRead: boolean
  createdAt: string
  annonceId?: number
  livraisonId?: number
  actionRequired: boolean
}

export default function DeliverymanNotifications() {
  const { t } = useLanguage()
  const router = useRouter()
  const auth = useAuth()
  const { isAuthenticated, userRole, userData, refreshUserData } = auth
  const { toast } = useToast()
  
  // États locaux
  const [notifications, setNotifications] = useState<DeliveryNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all')
  
  // Hook API
  const { execute: executeGetLivraisons } = useApiCall<Livraison[]>()

  // Ajouter un useEffect pour forcer le refresh
  useEffect(() => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
    if (token && !userData && refreshUserData) {
      refreshUserData()
    }
  }, [userData, refreshUserData])

  // WebSocket pour notifications temps réel (seulement si userData est disponible)
  const websocket = useLivreurWebSocket({
    userId: userData?.id || 0,
    onNewDeliveryAvailable: (data: any) => {
      const newNotification: DeliveryNotification = {
        id: Date.now(),
        type: 'new_delivery',
        title: 'Nouvelle livraison disponible',
        description: data.description || 'Une nouvelle livraison est disponible dans votre zone',
        clientName: data.clientName || 'Client',
        deliveryAddress: data.deliveryAddress || 'Adresse non spécifiée',
        price: data.price || 0,
        urgent: data.urgent || false,
        isRead: false,
        createdAt: new Date().toISOString(),
        annonceId: data.annonceId,
        livraisonId: data.livraisonId,
        actionRequired: true
      }
      setNotifications(prev => [newNotification, ...prev])
      
      toast({
        title: 'Nouvelle livraison !',
        description: 'Une nouvelle livraison est disponible',
      })
    },
    enableNotifications: !!userData,
    enableLocationTracking: false,
  })

  // Fonction de transformation des livraisons en notifications
  const transformLivraisonToNotification = (livraison: Livraison): DeliveryNotification => {
    // Validation des données essentielles
    if (!livraison || !livraison.id) {
      console.warn('Livraison invalide reçue:', livraison)
      throw new Error('Données de livraison invalides')
    }

    return {
      id: livraison.id,
      type: livraison.status === 'scheduled' ? 'new_delivery' : 'status_update',
      title: livraison.status === 'scheduled' ? 'Nouvelle livraison disponible' : 'Mise à jour de livraison',
      description: livraison.status === 'scheduled' 
        ? 'Une nouvelle livraison est disponible dans votre zone'
        : `Statut mis à jour: ${livraison.status || 'inconnu'}`,
      productName: livraison.annonce?.title || livraison.annonce?.description || `Livraison #${livraison.id}`,
      clientName: livraison.client?.first_name ? `${livraison.client.first_name} ${livraison.client.last_name || ''}`.trim() : 'Client',
      deliveryAddress: livraison.dropoff_location || 'Adresse de livraison non spécifiée',
      pickupAddress: livraison.pickup_location || 'Adresse de récupération non spécifiée',
      price: typeof livraison.cost === 'number' ? livraison.cost : (livraison.annonce?.price || 0),
      deliveryDate: livraison.estimated_delivery_time || livraison.delivery_time || livraison.pickup_time,
      size: 'Medium', // Pas de champ size dans le type Livraison
      urgent: livraison.annonce?.priority === true || false,
      isRead: false,
      createdAt: livraison.created_at || new Date().toISOString(),
      annonceId: livraison.annonce_id,
      livraisonId: livraison.id,
      actionRequired: livraison.status === 'scheduled'
    }
  }

  // Fonction de chargement des notifications
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || userRole !== 'delivery_man' || !userData) {
      return
    }

    setLoading(true)
    try {
      // Appel direct au service sans useApiCall pour éviter les problèmes de double wrapping
      const response = await livreurService.getMyLivraisons('scheduled')
      
      // Vérification que la réponse contient des données
      if (!response || !response.data) {
        console.warn('Aucune donnée reçue du service livreur')
        setNotifications([])
        return
      }
      
      const livraisons = Array.isArray(response.data) ? response.data : []
      
      const notifications = livraisons
        .slice(0, 10) // Limiter à 10 notifications
        .map(transformLivraisonToNotification)
      
      setNotifications(notifications)
      console.log(`${notifications.length} notifications chargées avec succès`)
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
      setNotifications([])
      toast({
        variant: 'destructive',
        title: 'Erreur de chargement',
        description: error instanceof Error ? error.message : 'Impossible de charger les notifications',
      })
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, userRole, userData, toast])

  // Chargement initial
  useEffect(() => {
    if (isAuthenticated && userRole === 'delivery_man' && userData) {
      console.log('Chargement des notifications pour le livreur:', userData.id)
      loadNotifications()
    }
  }, [loadNotifications, isAuthenticated, userRole, userData])

  // Fonctions de gestion des actions
  const handleAccept = useCallback(async (notificationId: number) => {
    try {
      const notification = notifications.find(n => n.id === notificationId)
      if (!notification || !notification.livraisonId) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Notification introuvable ou ID de livraison manquant',
        })
        return
      }

      console.log(`Acceptation de la livraison ${notification.livraisonId}...`)
      const response = await livreurService.acceptLivraison(notification.livraisonId)
      
      if (response && response.data) {
        // Supprimer la notification de la liste
        setNotifications(prev => prev.filter(n => n.id !== notificationId))

        toast({
          title: 'Livraison acceptée',
          description: `Livraison #${notification.livraisonId} acceptée avec succès`,
        })

        // Rediriger vers la page de livraison
        router.push(`/app_deliveryman/delivery/${notification.livraisonId}`)
      } else {
        throw new Error('Réponse invalide du serveur')
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error)
      toast({
        variant: 'destructive',
        title: 'Erreur d\'acceptation',
        description: error instanceof Error ? error.message : 'Impossible d\'accepter la livraison',
      })
    }
  }, [notifications, toast, router])

  const handleReject = useCallback((notificationId: number) => {
    // Marquer comme lue et supprimer de la liste
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    
    toast({
      title: 'Notification rejetée',
      description: 'La notification a été supprimée',
    })
  }, [toast])

  const markAsRead = useCallback((notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    )
  }, [])

  const refreshNotifications = useCallback(() => {
    loadNotifications()
  }, [loadNotifications])

  // Filtrage des notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      if (filter === 'unread') return !notification.isRead
      if (filter === 'urgent') return notification.urgent
      return true
    })
  }, [notifications, filter])

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      urgent: notifications.filter(n => n.urgent).length,
      actionRequired: notifications.filter(n => n.actionRequired).length
    }
  }, [notifications])

  // Vérification de l'authentification
  if (!isAuthenticated) {
    return (
      <DeliverymanLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">Chargement...</h3>
            <p className="text-gray-500">Vérification de l'authentification</p>
          </div>
        </div>
      </DeliverymanLayout>
    )
  }

  if (userRole !== 'delivery_man') {
    return (
      <DeliverymanLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Accès non autorisé</h3>
            <p className="text-gray-500">Vous devez être connecté en tant que livreur</p>
          </div>
        </div>
      </DeliverymanLayout>
    )
  }

  return (
    <DeliverymanLayout>
      <div className="space-y-6">
        {/* En-tête avec statistiques */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Gérez vos notifications de livraison</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshNotifications}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <BellOff className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Non lues</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.unread}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Urgentes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.urgent}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Action requise</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.actionRequired}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Toutes ({stats.total})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Non lues ({stats.unread})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'urgent'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Urgentes ({stats.urgent})
          </button>
        </div>

        {/* Liste des notifications */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  notification.urgent
                    ? 'border-red-500'
                    : notification.isRead
                    ? 'border-gray-300'
                    : 'border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {notification.urgent && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          Urgent
                        </span>
                      )}
                      {!notification.isRead && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Nouveau
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{notification.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {notification.productName && (
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Produit:</span>
                          <span>{notification.productName}</span>
                        </div>
                      )}
                      
                      {notification.clientName && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Client:</span>
                          <span>{notification.clientName}</span>
                        </div>
                      )}
                      
                      {notification.deliveryAddress && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Livraison:</span>
                          <span>{notification.deliveryAddress}</span>
                        </div>
                      )}
                      
                      {notification.price && (
                        <div className="flex items-center space-x-2">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Prix:</span>
                          <span>€{notification.price}</span>
                        </div>
                      )}
                      
                      {notification.deliveryDate && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Date:</span>
                          <span>{new Date(notification.deliveryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {notification.size && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Taille:</span>
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {notification.size}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    {notification.actionRequired && (
                      <>
                        <button
                          onClick={() => handleAccept(notification.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleReject(notification.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Rejeter
                        </button>
                      </>
                    )}
                    
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              {filter === 'all'
                ? 'Aucune notification'
                : filter === 'unread'
                ? 'Aucune notification non lue'
                : 'Aucune notification urgente'}
            </h3>
            <p className="text-gray-500">
              {filter !== 'all' ? (
                <button
                  onClick={() => setFilter('all')}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Voir toutes les notifications
                </button>
              ) : (
                'Les nouvelles notifications apparaîtront ici'
              )}
            </p>
          </div>
        )}
      </div>
    </DeliverymanLayout>
  )
}