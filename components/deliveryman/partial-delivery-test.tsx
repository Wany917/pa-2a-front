'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/app/auth-context'
import { useRouter } from 'next/navigation'
import {
  Package,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Send,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Truck,
  Navigation,
  Phone,
  Mail,
  Star,
  ArrowRight,
  RefreshCw,
  Play,
  Pause,
  Square
} from 'lucide-react'
import { useLanguage } from '@/components/language-context'
import DeliverymanLayout from './layout'
import { useApiCall } from '@/hooks/use-api-call'
import { usePartialDeliveryWebSocket } from '@/hooks/use-partial-delivery-websocket'
import { PartialDeliveryService } from '@/services/partial-delivery.service'
import type {
  PartialDelivery,
  DeliverySegment,
  PartialDeliveryRequestEvent,
  DeliveryCoordinationEvent,
  PackageHandoverEvent,
  GroupChatMessageEvent
} from '@/types/api'

interface TestScenario {
  id: string
  name: string
  description: string
  action: () => void
  status: 'idle' | 'running' | 'success' | 'error'
  result?: string
}

interface ChatMessage {
  id: string
  senderId: number
  senderName: string
  message: string
  timestamp: string
  type: 'text' | 'system'
}

export default function PartialDeliveryTest() {
  const { t } = useLanguage()
  const router = useRouter()
  const { userData } = useAuth()
  
  // Récupération de l'ID utilisateur
  const getUserId = () => {
    if (!userData) return null;
    
    // Essayer différentes sources d'ID selon la structure des données
    if (userData.id) return userData.id;
    if (userData.livreur?.id) return userData.livreur.id;
    if (userData.user_id) return userData.user_id;
    
    return null;
  };
  const [activeTab, setActiveTab] = useState<'scenarios' | 'websocket' | 'coordination' | 'chat'>('scenarios')
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentLivraisonId, setCurrentLivraisonId] = useState<number | null>(null)
  const [coordinationInfo, setCoordinationInfo] = useState<any>(null)
  const [websocketStatus, setWebsocketStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')

  // API calls
  const { execute: executeCreatePartialDelivery, loading: createLoading } = useApiCall()
  const { execute: executeGetPartialDelivery, loading: getLoading } = useApiCall()
  const { execute: executeCalculateCost, loading: calculateLoading } = useApiCall()
  const { execute: executeInitiateCoordination, loading: coordinationLoading } = useApiCall()

  // WebSocket hooks
  const {
    requestPartialDelivery,
    initiateDeliveryCoordination,
    confirmPackageHandover,
    sendGroupChatMessage,
    joinDeliveryCoordination,
    leaveDeliveryCoordination,
    updateLocation
  } = usePartialDeliveryWebSocket({
    userId: getUserId() || 1, // Utiliser l'ID du contexte d'auth ou 1 par défaut pour les tests
    userType: 'livreur',
    onPartialDeliveryRequest: (event: PartialDeliveryRequestEvent) => {
      console.log('🔔 Nouvelle demande de livraison partielle:', event)
      addChatMessage('system', 'Système', `Nouvelle demande de livraison partielle reçue: ${event.livraisonId}`)
      setTestResults(prev => ({
        ...prev,
        lastPartialDeliveryRequest: event
      }))
    },
    onDeliveryCoordinationStarted: (event: DeliveryCoordinationEvent) => {
      console.log('🚀 Coordination de livraison démarrée:', event)
      addChatMessage('system', 'Système', `Coordination démarrée pour la livraison ${event.livraisonId}`)
      setCoordinationInfo(event)
    },
    onPackageHandoverConfirmed: (event: PackageHandoverEvent) => {
      console.log('📦 Remise de colis confirmée:', event)
      addChatMessage('system', 'Système', `Remise confirmée: ${event.fromSegmentId} → ${event.toSegmentId}`)
    },
    onGroupChatMessage: (event: GroupChatMessageEvent) => {
      console.log('💬 Message de chat reçu:', event)
      addChatMessage('text', `Livreur ${event.senderId}`, event.message)
    },
    onLocationUpdate: (data: any) => {
      console.log('📍 Mise à jour de localisation:', data)
      setTestResults(prev => ({
        ...prev,
        lastLocationUpdate: data
      }))
    }
  })

  const addChatMessage = (type: 'text' | 'system', senderName: string, message: string) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: type === 'system' ? 0 : 1,
      senderName,
      message,
      timestamp: new Date().toLocaleTimeString(),
      type
    }
    setChatMessages(prev => [...prev, newMsg])
  }

  // Scénarios de test
  const [scenarios, setScenarios] = useState<TestScenario[]>([
    {
      id: 'create-partial-delivery',
      name: 'Créer une livraison partielle',
      description: 'Teste la création d\'une nouvelle livraison partielle avec segments',
      action: async () => {
        try {
          const testData = {
            originalLivraisonId: 1,
            segments: [
              {
                livreurId: 1,
                pickupLocation: {
                  latitude: 48.8566,
                  longitude: 2.3522,
                  address: 'Paris Centre'
                },
                dropoffLocation: {
                  latitude: 48.8606,
                  longitude: 2.3376,
                  address: 'Louvre'
                },
                estimatedDuration: 30,
                cost: 15.50
              },
              {
                livreurId: 2,
                pickupLocation: {
                  latitude: 48.8606,
                  longitude: 2.3376,
                  address: 'Louvre'
                },
                dropoffLocation: {
                  latitude: 48.8738,
                  longitude: 2.2950,
                  address: 'Arc de Triomphe'
                },
                estimatedDuration: 25,
                cost: 12.00
              }
            ]
          }
          
          const result = await executeCreatePartialDelivery(
            PartialDeliveryService.createPartialDelivery(testData)
          )
          
          setTestResults(prev => ({
            ...prev,
            createPartialDelivery: result
          }))
          
          updateScenarioStatus('create-partial-delivery', 'success', `Livraison partielle créée: ID ${result?.id}`)
        } catch (error) {
          updateScenarioStatus('create-partial-delivery', 'error', `Erreur: ${error}`)
        }
      },
      status: 'idle'
    },
    {
      id: 'calculate-cost',
      name: 'Calculer le coût',
      description: 'Teste le calcul du coût d\'une livraison partielle',
      action: async () => {
        try {
          const segments = [
            {
              pickupLocation: { latitude: 48.8566, longitude: 2.3522, address: 'Paris Centre' },
              dropoffLocation: { latitude: 48.8606, longitude: 2.3376, address: 'Louvre' },
              estimatedDuration: 30
            }
          ]
          
          const result = await executeCalculateCost(
            PartialDeliveryService.calculatePartialDeliveryCost(segments)
          )
          
          setTestResults(prev => ({
            ...prev,
            calculateCost: result
          }))
          
          updateScenarioStatus('calculate-cost', 'success', `Coût calculé: ${result?.totalCost}€`)
        } catch (error) {
          updateScenarioStatus('calculate-cost', 'error', `Erreur: ${error}`)
        }
      },
      status: 'idle'
    },
    {
      id: 'websocket-request',
      name: 'Demande WebSocket',
      description: 'Teste l\'envoi d\'une demande de livraison partielle via WebSocket',
      action: () => {
        try {
          const segments = [
            {
              livreurId: 2,
              pickupLocation: { latitude: 48.8566, longitude: 2.3522, address: 'Paris Centre' },
              dropoffLocation: { latitude: 48.8606, longitude: 2.3376, address: 'Louvre' },
              estimatedDuration: 30,
              cost: 15.50
            }
          ]
          
          requestPartialDelivery(1, segments)
          updateScenarioStatus('websocket-request', 'success', 'Demande envoyée via WebSocket')
          addChatMessage('system', 'Test', 'Demande de livraison partielle envoyée')
        } catch (error) {
          updateScenarioStatus('websocket-request', 'error', `Erreur: ${error}`)
        }
      },
      status: 'idle'
    },
    {
      id: 'initiate-coordination',
      name: 'Initier coordination',
      description: 'Teste l\'initiation de la coordination entre livreurs',
      action: () => {
        try {
          const coordinationData = {
            livraisonId: 1,
            currentSegmentId: 1,
            nextSegmentId: 2,
            handoverLocation: {
              latitude: 48.8606,
              longitude: 2.3376,
              address: 'Point de remise Louvre'
            }
          }
          
          initiateDeliveryCoordination(coordinationData)
          setCurrentLivraisonId(1)
          updateScenarioStatus('initiate-coordination', 'success', 'Coordination initiée')
          addChatMessage('system', 'Test', 'Coordination de livraison initiée')
        } catch (error) {
          updateScenarioStatus('initiate-coordination', 'error', `Erreur: ${error}`)
        }
      },
      status: 'idle'
    },
    {
      id: 'join-coordination',
      name: 'Rejoindre coordination',
      description: 'Teste la participation à une coordination existante',
      action: () => {
        try {
          if (!currentLivraisonId) {
            updateScenarioStatus('join-coordination', 'error', 'Aucune livraison active')
            return
          }
          
          joinDeliveryCoordination(currentLivraisonId)
          updateScenarioStatus('join-coordination', 'success', 'Coordination rejointe')
          addChatMessage('system', 'Test', 'Coordination rejointe avec succès')
        } catch (error) {
          updateScenarioStatus('join-coordination', 'error', `Erreur: ${error}`)
        }
      },
      status: 'idle'
    },
    {
      id: 'update-location',
      name: 'Mettre à jour position',
      description: 'Teste la mise à jour de la position GPS',
      action: () => {
        try {
          const locationData = {
            latitude: 48.8566 + (Math.random() - 0.5) * 0.01,
            longitude: 2.3522 + (Math.random() - 0.5) * 0.01,
            timestamp: new Date().toISOString()
          }
          
          updateLocation(locationData)
          updateScenarioStatus('update-location', 'success', `Position: ${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`)
          addChatMessage('system', 'GPS', `Position mise à jour: ${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`)
        } catch (error) {
          updateScenarioStatus('update-location', 'error', `Erreur: ${error}`)
        }
      },
      status: 'idle'
    }
  ])

  const updateScenarioStatus = (id: string, status: TestScenario['status'], result?: string) => {
    setScenarios(prev => prev.map(scenario => 
      scenario.id === id ? { ...scenario, status, result } : scenario
    ))
  }

  const runScenario = (scenario: TestScenario) => {
    updateScenarioStatus(scenario.id, 'running')
    scenario.action()
  }

  const sendChatMessage = () => {
    if (!newMessage.trim() || !currentLivraisonId) return
    
    try {
      sendGroupChatMessage(currentLivraisonId, newMessage, 'text')
      addChatMessage('text', 'Moi', newMessage)
      setNewMessage('')
    } catch (error) {
      console.error('Erreur envoi message:', error)
    }
  }

  const confirmHandover = () => {
    if (!currentLivraisonId) return
    
    try {
      confirmPackageHandover({
        fromSegmentId: 1,
        toSegmentId: 2,
        verificationCode: '1234',
        handoverTime: new Date().toISOString()
      })
      addChatMessage('system', 'Test', 'Remise de colis confirmée')
    } catch (error) {
      console.error('Erreur confirmation remise:', error)
    }
  }

  return (
    <DeliverymanLayout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🧪 Test de Livraison Partielle
            </h1>
            <p className="text-gray-600">
              Interface de test pour toutes les fonctionnalités de livraison partielle
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'scenarios', label: '🎯 Scénarios de Test', icon: Play },
                  { id: 'websocket', label: '🔌 WebSocket Status', icon: RefreshCw },
                  { id: 'coordination', label: '🤝 Coordination', icon: Users },
                  { id: 'chat', label: '💬 Chat Groupe', icon: MessageSquare }
                ].map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'scenarios' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Play className="h-5 w-5 mr-2 text-green-600" />
                    Scénarios de Test
                  </h2>
                  <div className="space-y-4">
                    {scenarios.map(scenario => (
                      <div key={scenario.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{scenario.name}</h3>
                          <div className="flex items-center space-x-2">
                            {scenario.status === 'running' && (
                              <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                            )}
                            {scenario.status === 'success' && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {scenario.status === 'error' && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <button
                              onClick={() => runScenario(scenario)}
                              disabled={scenario.status === 'running'}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                            >
                              {scenario.status === 'running' ? 'En cours...' : 'Tester'}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                        {scenario.result && (
                          <div className={`text-xs p-2 rounded ${
                            scenario.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {scenario.result}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'websocket' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <RefreshCw className="h-5 w-5 mr-2 text-blue-600" />
                    État WebSocket
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className={`h-3 w-3 rounded-full ${
                        websocketStatus === 'connected' ? 'bg-green-500' :
                        websocketStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium">
                        Status: {websocketStatus === 'connected' ? 'Connecté' : 
                                websocketStatus === 'connecting' ? 'Connexion...' : 'Déconnecté'}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded">
                      <h3 className="font-medium mb-2">Derniers événements:</h3>
                      <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                        {JSON.stringify(testResults, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'coordination' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    Coordination de Livraison
                  </h2>
                  
                  {currentLivraisonId ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-green-800">
                          📦 Livraison active: #{currentLivraisonId}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={confirmHandover}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Confirmer Remise
                        </button>
                        <button
                          onClick={() => leaveDeliveryCoordination(currentLivraisonId)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Quitter Coordination
                        </button>
                      </div>
                      
                      {coordinationInfo && (
                        <div className="bg-gray-50 p-4 rounded">
                          <h3 className="font-medium mb-2">Informations de coordination:</h3>
                          <pre className="text-xs text-gray-600">
                            {JSON.stringify(coordinationInfo, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucune coordination active</p>
                      <p className="text-sm">Initiez une coordination pour commencer</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                    Chat de Groupe
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-gray-50">
                      {chatMessages.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucun message</p>
                      ) : (
                        <div className="space-y-2">
                          {chatMessages.map(msg => (
                            <div key={msg.id} className={`p-2 rounded ${
                              msg.type === 'system' ? 'bg-blue-100 text-blue-800' : 'bg-white'
                            }`}>
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span className="font-medium">{msg.senderName}</span>
                                <span>{msg.timestamp}</span>
                              </div>
                              <p className="text-sm">{msg.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Input */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        placeholder="Tapez votre message..."
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={!currentLivraisonId}
                      />
                      <button
                        onClick={sendChatMessage}
                        disabled={!newMessage.trim() || !currentLivraisonId}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {!currentLivraisonId && (
                      <p className="text-sm text-gray-500 text-center">
                        Initiez une coordination pour activer le chat
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Actions Rapides</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => runScenario(scenarios[0])}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    🚀 Créer Livraison Test
                  </button>
                  <button
                    onClick={() => runScenario(scenarios[2])}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    📡 Test WebSocket
                  </button>
                  <button
                    onClick={() => runScenario(scenarios[3])}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                  >
                    🤝 Initier Coordination
                  </button>
                  <button
                    onClick={() => {
                      setChatMessages([])
                      setTestResults({})
                      setCurrentLivraisonId(null)
                      setCoordinationInfo(null)
                    }}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  >
                    🧹 Nettoyer
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">État du Test</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tests réussis:</span>
                    <span className="font-medium text-green-600">
                      {scenarios.filter(s => s.status === 'success').length}/{scenarios.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Livraison active:</span>
                    <span className="font-medium">
                      {currentLivraisonId ? `#${currentLivraisonId}` : 'Aucune'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Messages chat:</span>
                    <span className="font-medium">{chatMessages.length}</span>
                  </div>
                </div>
              </div>

              {/* Documentation */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">📚 Guide de Test</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>1.</strong> Créez une livraison partielle</p>
                  <p><strong>2.</strong> Initiez la coordination</p>
                  <p><strong>3.</strong> Rejoignez la coordination</p>
                  <p><strong>4.</strong> Testez le chat de groupe</p>
                  <p><strong>5.</strong> Confirmez la remise</p>
                  <p><strong>6.</strong> Vérifiez les WebSockets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DeliverymanLayout>
  )
}