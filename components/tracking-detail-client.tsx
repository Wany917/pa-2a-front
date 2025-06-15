"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Calendar, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import { clientService } from "@/services/clientService"
import type { Livraison, Colis } from "@/types/api"
import TrackingMap from "@/components/tracking-map"

// Types pour les données de suivi unifiées
interface TrackingEvent {
  date: string
  time: string
  location: string
  status: string
  description: string
}

interface UnifiedTrackingData {
  id: string
  type: 'livraison' | 'colis'
  status: string
  title: string
  origin: string
  destination: string
  estimatedDelivery?: string
  createdDate: string
  events: TrackingEvent[]
  livreur?: {
    id: number
    name: string
    phone?: string
  }
  cost?: number
  trackingNumber?: string
  currentPosition?: {
    latitude: number
    longitude: number
    timestamp: string
  }
}

export default function TrackingDetailClient({ id }: { id: string }) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [trackingData, setTrackingData] = useState<UnifiedTrackingData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    loadTrackingData()
  }, [id])

  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const userResponse = await clientService.getProfile()
        if (userResponse.success && userResponse.data) {
          setUserEmail(userResponse.data.email)
        }
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err)
      }
    }
    
    loadUserEmail()
  }, [])

  const sendTrackingEmail = async () => {
    if (!trackingData || !userEmail) return
    
    try {
      setSendingEmail(true)
      
      const response = await clientService.sendTrackingEmail({
        email: userEmail,
        trackingId: trackingData.id,
        packageName: trackingData.title,
        recipientName: userEmail.split('@')[0],
        estimatedDelivery: trackingData.estimatedDelivery || "Bientôt"
      })
      
      if (response.success) {
        setEmailSent(true)
        setTimeout(() => setEmailSent(false), 5000)
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'email:', err)
    } finally {
      setSendingEmail(false)
    }
  }

  const loadTrackingData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Chargement des données de suivi pour ID:', id)

      // Essayer d'abord de charger comme un colis (par tracking_number)
      try {
        console.log('Tentative de chargement comme colis:', id)
        await loadColisData(id)
        return // Si succès, on s'arrête ici
      } catch (colisError) {
        console.log('Échec du chargement comme colis, tentative comme livraison')
        
        // Si ça échoue, essayer comme un ID de livraison
        const livraisonId = parseInt(id)
        if (!isNaN(livraisonId)) {
          console.log('Chargement des données livraison:', livraisonId)
          await loadLivraisonData(livraisonId)
        } else {
          setError("Aucune donnée trouvée pour cet identifiant")
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err)
      setError("Impossible de charger les données de suivi")
    } finally {
      setLoading(false)
    }
  }

  const loadLivraisonData = async (livraisonId: number) => {
    try {
      console.log('Appel API trackLivraison pour ID:', livraisonId)
      const response = await clientService.trackLivraison(livraisonId)
      console.log('Réponse trackLivraison:', response)
      
      if (response.success && response.data) {
        const { livraison, currentPosition, estimatedArrival } = response.data
        console.log('Données livraison reçues:', livraison)
        
        // Adapter les propriétés selon la structure réelle
        const livraisonData = livraison as any
        
        const unifiedData: UnifiedTrackingData = {
          id: livraison.id.toString(),
          type: 'livraison',
          status: livraison.status || 'pending',
          title: `Livraison #${livraison.id}`,
          origin: livraisonData.pickup_location || 
                  livraisonData.pickupLocation || 
                  livraisonData.startingAddress || 
                  livraisonData.starting_address ||
                  "Adresse de départ",
          destination: livraisonData.dropoff_location || 
                      livraisonData.dropoffLocation || 
                      livraisonData.destinationAddress || 
                      livraisonData.destination_address ||
                      "Adresse de destination",
          estimatedDelivery: estimatedArrival || 
                           livraisonData.estimated_delivery_time || 
                           livraisonData.estimatedDeliveryTime ||
                           livraisonData.scheduled_date ||
                           livraisonData.scheduledDate,
          createdDate: livraisonData.created_at || 
                      livraisonData.createdAt || 
                      new Date().toISOString(),
          cost: livraison.cost || 0,
          currentPosition,
          livreur: livraisonData.livreur ? {
            id: livraisonData.livreur.id,
            name: `${livraisonData.livreur.first_name || livraisonData.livreur.firstName || ''} ${livraisonData.livreur.last_name || livraisonData.livreur.lastName || ''}`.trim() || 'Livreur',
            phone: livraisonData.livreur.phone_number || livraisonData.livreur.phoneNumber
          } : undefined,
          events: generateLivraisonEvents(livraison)
        }
        
        console.log('Données unifiées générées:', unifiedData)
        setTrackingData(unifiedData)
      } else {
        console.error('Erreur API trackLivraison:', response)
        setError("Livraison non trouvée")
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la livraison:', err)
      
      // Fallback: essayer de récupérer directement la livraison par ID
      try {
        console.log('Fallback: récupération directe de la livraison')
        const fallbackResponse = await clientService.getLivraisonById(livraisonId)
        console.log('Réponse fallback:', fallbackResponse)
        
        if (fallbackResponse.success && fallbackResponse.data) {
          const livraison = fallbackResponse.data
          const livraisonData = livraison as any
          
          const unifiedData: UnifiedTrackingData = {
            id: livraison.id.toString(),
            type: 'livraison',
            status: livraison.status,
            title: `Livraison #${livraison.id}`,
            origin: livraisonData.pickup_location || 
                    livraisonData.startingAddress || 
                    "Adresse de départ",
            destination: livraisonData.dropoff_location || 
                        livraisonData.destinationAddress || 
                        "Adresse de destination",
            createdDate: livraisonData.created_at || 
                        livraisonData.createdAt || 
                        new Date().toISOString(),
            cost: livraison.cost,
            events: generateLivraisonEvents(livraison)
          }
          
          setTrackingData(unifiedData)
        } else {
          setError("Livraison non trouvée")
        }
      } catch (fallbackErr) {
        console.error('Erreur fallback:', fallbackErr)
        setError("Erreur lors du chargement des données de livraison")
      }
    }
  }

  const loadColisData = async (trackingNumber: string) => {
    try {
      console.log('Appel API trackColis pour numéro:', trackingNumber)
      const response = await clientService.trackColis(trackingNumber)
      console.log('Réponse trackColis:', response)
      
      if (response.success && response.data) {
        const { colis, history } = response.data
        console.log('Données colis reçues:', colis)
        console.log('Historique colis:', history)
        
        console.log('📦 Données colis complètes:', colis)
        console.log('📦 Annonce associée:', colis.annonce)
        console.log('📦 Adresse de départ extraite:', colis.annonce?.startingAddress)
        console.log('📦 Adresse de destination extraite:', colis.annonce?.destinationAddress)
        console.log('📦 Tracking number (camelCase):', colis.trackingNumber)
        console.log('📦 Tracking number (snake_case):', colis.tracking_number)
        console.log('📦 Date création (camelCase):', colis.createdAt)
        console.log('📦 Date création (snake_case):', colis.created_at)
        
        const trackingNumber = colis.trackingNumber || colis.tracking_number || colis.id?.toString() || 'N/A'
        const createdDate = colis.createdAt || colis.created_at || new Date().toISOString()
        
        const unifiedData: UnifiedTrackingData = {
          id: trackingNumber,
          type: 'colis',
          status: colis.status || 'stored',
          title: `Colis ${trackingNumber}`,
          origin: colis.annonce?.startingAddress || 
                  colis.annonce?.starting_address ||
                  colis.annonce?.pickupLocation ||
                  'Adresse d\'expédition',
          destination: colis.annonce?.destinationAddress || 
                      colis.annonce?.destination_address ||
                      colis.annonce?.dropoffLocation ||
                      'Adresse de destination',
          createdDate: createdDate,
          trackingNumber: trackingNumber,
          events: (history || []).map(event => {
            const eventDate = new Date(event.timestamp || event.created_at || Date.now())
            return {
              date: eventDate.toLocaleDateString('fr-FR'),
              time: eventDate.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              location: event.location || 'Localisation inconnue',
              status: event.status || 'unknown',
              description: event.description || getStatusDescription(event.status || 'unknown')
            }
          })
        }
        
        console.log('📦 Données unifiées pour la carte:', {
          origin: unifiedData.origin,
          destination: unifiedData.destination
        })
        
        setTrackingData(unifiedData)
      } else {
        console.error('Erreur API trackColis:', response)
        throw new Error("Colis non trouvé")
      }
    } catch (err) {
      console.error('Erreur lors du chargement du colis:', err)
      throw err // Relancer l'erreur pour permettre le fallback
    }
  }

  const generateLivraisonEvents = (livraison: Livraison): TrackingEvent[] => {
    const events: TrackingEvent[] = []
    const livraisonData = livraison as any
    
    // Événement de création
    const createdDate = livraisonData.created_at || livraisonData.createdAt
    if (createdDate) {
      events.push({
        date: new Date(createdDate).toLocaleDateString('fr-FR'),
        time: new Date(createdDate).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        location: livraisonData.pickup_location || 
                  livraisonData.startingAddress || 
                  "Point de départ",
        status: 'scheduled',
        description: 'Livraison programmée'
      })
    }

    // Événement de prise en charge si la livraison est en cours
    if (livraison.status === 'in_progress' || livraison.status === 'completed') {
      const pickupTime = livraisonData.pickup_time || livraisonData.pickupTime || createdDate
      if (pickupTime) {
        events.push({
          date: new Date(pickupTime).toLocaleDateString('fr-FR'),
          time: new Date(pickupTime).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          location: livraisonData.pickup_location || 
                    livraisonData.startingAddress || 
                    "Point de départ",
          status: 'in_progress',
          description: 'Colis pris en charge par le livreur'
        })
      }
    }

    // Événement de livraison si completed
    if (livraison.status === 'completed') {
      const deliveryTime = livraisonData.delivery_time || 
                          livraisonData.deliveryTime || 
                          livraisonData.scheduled_date
      if (deliveryTime) {
        events.push({
          date: new Date(deliveryTime).toLocaleDateString('fr-FR'),
          time: new Date(deliveryTime).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          location: livraisonData.dropoff_location || 
                    livraisonData.destinationAddress || 
                    "Point de destination",
          status: 'completed',
          description: 'Colis livré avec succès'
        })
      }
    }

    return events.reverse() // Inverser pour avoir les plus récents en premier
  }

  const getStatusDescription = (status: string): string => {
    const descriptions: Record<string, string> = {
      'stored': 'Colis en stockage',
      'in_transit': 'Colis en transit',
      'delivered': 'Colis livré',
      'lost': 'Colis perdu',
      'scheduled': 'Livraison programmée',
      'in_progress': 'Livraison en cours',
      'completed': 'Livraison terminée',
      'cancelled': 'Livraison annulée',
      'pending': 'En attente'
    }
    return descriptions[status] || status
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadTrackingData()
    setRefreshing(false)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "scheduled":
      case "stored":
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: <Package className="h-5 w-5 text-yellow-600" />,
          text: "En attente",
        }
      case "in_progress":
      case "in_transit":
        return {
          color: "bg-blue-100 text-blue-800",
          icon: <Truck className="h-5 w-5 text-blue-600" />,
          text: "En transit",
        }
      case "completed":
      case "delivered":
        return {
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          text: "Livré",
        }
      case "cancelled":
      case "lost":
        return {
          color: "bg-red-100 text-red-800",
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          text: "Problème",
        }
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: <Package className="h-5 w-5 text-gray-600" />,
          text: status,
        }
    }
  }

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString || dateString === 'undefined' || dateString === 'null' || dateString.trim() === '') {
      return "Date non disponible"
    }
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.warn('Date invalide reçue:', dateString)
        return "Date invalide"
      }
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error, 'Date:', dateString)
      return "Date invalide"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des informations de suivi...</p>
        </div>
      </div>
    )
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <Link href="/app_client">
              <Image
                src="/logo.png"
                alt="EcoDeli Logo"
                width={120}
                height={40}
                className="h-auto"
              />
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-4">Suivi introuvable</h1>
            <p className="text-gray-600 mb-6">{error || "Identifiant de suivi invalide"}</p>
            <div className="space-x-4">
              <Link 
                href="/app_client/tracking" 
                className="inline-flex items-center text-green-500 hover:text-green-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au suivi
              </Link>
              <button
                onClick={loadTrackingData}
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const statusInfo = getStatusInfo(trackingData.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <Link href="/app_client">
            <Image
              src="/logo.png"
              alt="EcoDeli Logo"
              width={120}
              height={40}
              className="h-auto"
            />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link 
              href="/app_client/tracking" 
              className="inline-flex items-center text-gray-600 hover:text-green-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au suivi
            </Link>
          </div>

          {/* En-tête avec statut */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold">{trackingData.title}</h1>
                <p className="text-gray-500">
                  ID: {trackingData.id}
                  {trackingData.trackingNumber && trackingData.trackingNumber !== trackingData.id && 
                    ` • Numéro de suivi: ${trackingData.trackingNumber}`
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full ${statusInfo.color} flex items-center`}>
                  {statusInfo.icon}
                  <span className="ml-2 text-sm font-medium">{statusInfo.text}</span>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="Actualiser"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Expédition</h3>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <span className="text-sm text-gray-600">{trackingData.origin}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Destination</h3>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-green-500 mt-1" />
                  <span className="text-sm text-gray-600">{trackingData.destination}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Date de création</h3>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{formatDate(trackingData.createdDate)}</span>
                </div>
              </div>

              {trackingData.estimatedDelivery && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Livraison estimée</h3>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">{formatDate(trackingData.estimatedDelivery)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Informations livreur */}
            {trackingData.livreur && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Livreur assigné</h3>
                <p className="text-sm text-gray-700">{trackingData.livreur.name}</p>
                {trackingData.livreur.phone && (
                  <p className="text-sm text-gray-600">{trackingData.livreur.phone}</p>
                )}
              </div>
            )}

            {/* Coût */}
            {trackingData.cost && (
              <div className="mt-4 text-right">
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                  {trackingData.cost}€
                </span>
              </div>
            )}
          </div>

          {/* Historique des événements */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Historique de suivi</h2>

            {trackingData.events.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Aucun événement de suivi disponible</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trackingData.events.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{event.description}</p>
                        <span className="text-xs text-gray-500">{event.time}</span>
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-500">{event.location}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Carte de suivi */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Suivi en temps réel</span>
            </h2>
            <TrackingMap
              origin={trackingData.origin}
              destination={trackingData.destination}
              currentPosition={trackingData.currentPosition}
              deliveryStatus={trackingData.status}
              className="h-96 w-full"
            />
          </div>

          {/* Position actuelle si disponible */}
          {trackingData.currentPosition && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Position actuelle</h2>
              <div className="text-sm text-gray-600">
                <p>Latitude: {trackingData.currentPosition.latitude}</p>
                <p>Longitude: {trackingData.currentPosition.longitude}</p>
                <p>Dernière mise à jour: {new Date(trackingData.currentPosition.timestamp).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2025 EcoDeli. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

