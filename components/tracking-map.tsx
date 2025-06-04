"use client"

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Truck } from 'lucide-react'

// Types pour les données de position
interface Position {
  latitude: number
  longitude: number
  timestamp: string
}

interface TrackingMapProps {
  origin: string
  destination: string
  currentPosition?: Position
  deliveryStatus: string
  className?: string
}

// Composant de carte Leaflet
export default function TrackingMap({ 
  origin, 
  destination, 
  currentPosition, 
  deliveryStatus,
  className = "" 
}: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [leaflet, setLeaflet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null)
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null)

  // Charger Leaflet dynamiquement
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Charger Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
          link.crossOrigin = ''
          document.head.appendChild(link)
        }

        // Charger Leaflet JS
        const L = await import('leaflet')
        
        // Fix pour les icônes par défaut de Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })

        setLeaflet(L)
      } catch (err) {
        console.error('Erreur lors du chargement de Leaflet:', err)
        setError('Impossible de charger la carte')
      } finally {
        setIsLoading(false)
      }
    }

    loadLeaflet()
  }, [])

  // Géocoder les adresses
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      console.log('🗺️ Géocodage de l\'adresse:', address)
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`
      )
      const data = await response.json()
      console.log('🗺️ Réponse API géocodage pour "' + address + '":', data)
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates
        console.log('🗺️ Coordonnées trouvées pour "' + address + '":', { lat, lng, label: data.features[0].properties.label })
        return [lat, lng]
      }
      console.log('🗺️ Aucune coordonnée trouvée pour:', address)
      return null
    } catch (err) {
      console.error('🗺️ Erreur de géocodage pour "' + address + '":', err)
      return null
    }
  }

  // Initialiser la carte
  useEffect(() => {
    if (!leaflet || !mapRef.current || map) return

    const initMap = async () => {
      try {
        // Géocoder les adresses
        const [originCoords, destCoords] = await Promise.all([
          geocodeAddress(origin),
          geocodeAddress(destination)
        ])

        setOriginCoords(originCoords)
        setDestinationCoords(destCoords)

        // Coordonnées par défaut (Paris) si le géocodage échoue
        const defaultCenter: [number, number] = [48.8566, 2.3522]
        const center = originCoords || destCoords || defaultCenter

        // Créer la carte
        const mapInstance = leaflet.map(mapRef.current).setView(center, 12)

        // Ajouter les tuiles OpenStreetMap
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance)

        // Créer des icônes personnalisées
        const originIcon = leaflet.divIcon({
          html: `<div class="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full text-white shadow-lg">
                   <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                     <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                   </svg>
                 </div>`,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })

        const destinationIcon = leaflet.divIcon({
          html: `<div class="flex items-center justify-center w-8 h-8 bg-red-500 rounded-full text-white shadow-lg">
                   <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                     <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                   </svg>
                 </div>`,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })

        const currentIcon = leaflet.divIcon({
          html: `<div class="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full text-white shadow-lg animate-pulse">
                   <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                     <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                     <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                   </svg>
                 </div>`,
          className: 'custom-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        })

        // Ajouter les marqueurs
        if (originCoords) {
          leaflet.marker(originCoords, { icon: originIcon })
            .addTo(mapInstance)
            .bindPopup(`<strong>Départ:</strong><br>${origin}`)
        }

        if (destCoords) {
          leaflet.marker(destCoords, { icon: destinationIcon })
            .addTo(mapInstance)
            .bindPopup(`<strong>Destination:</strong><br>${destination}`)
        }

        // Ajouter le marqueur de position actuelle si disponible
        if (currentPosition) {
          const currentCoords: [number, number] = [currentPosition.latitude, currentPosition.longitude]
          leaflet.marker(currentCoords, { icon: currentIcon })
            .addTo(mapInstance)
            .bindPopup(`<strong>Position actuelle</strong><br>Dernière mise à jour: ${new Date(currentPosition.timestamp).toLocaleString('fr-FR')}`)
        }

        // Tracer une ligne entre l'origine et la destination
        if (originCoords && destCoords) {
          const routeLine = leaflet.polyline([originCoords, destCoords], {
            color: '#10b981',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
          }).addTo(mapInstance)

          // Ajuster la vue pour inclure tous les points
          const group = leaflet.featureGroup([
            leaflet.marker(originCoords),
            leaflet.marker(destCoords),
            ...(currentPosition ? [leaflet.marker([currentPosition.latitude, currentPosition.longitude])] : [])
          ])
          mapInstance.fitBounds(group.getBounds().pad(0.1))
        }

        setMap(mapInstance)
      } catch (err) {
        console.error('Erreur lors de l\'initialisation de la carte:', err)
        setError('Erreur lors de l\'initialisation de la carte')
      }
    }

    initMap()
  }, [leaflet, origin, destination, currentPosition])

  // Nettoyer la carte lors du démontage
  useEffect(() => {
    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [map])

  if (isLoading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-600">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Légende */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3 text-xs">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Départ</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Destination</span>
          </div>
          {currentPosition && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Position actuelle</span>
            </div>
          )}
        </div>
      </div>

      {/* Statut de livraison */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
        <div className="flex items-center space-x-2">
          <Truck className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">
            Statut: {deliveryStatus === 'in_progress' ? 'En cours' : 
                     deliveryStatus === 'completed' ? 'Livré' : 
                     deliveryStatus === 'scheduled' ? 'Programmé' : deliveryStatus}
          </span>
        </div>
      </div>
    </div>
  )
}