import apiClient, { ApiResponse } from '@/config/api'
import { API_ROUTES } from '@/config/routes'

export interface AddressSuggestion {
  label: string
  value: string
  coordinates: {
    latitude: number
    longitude: number
  }
  context: string
}

export interface RouteSegment {
  startAddress: string
  endAddress: string
  distance: number
  estimatedDuration: number
  estimatedCost: number
  startCoordinates: {
    latitude: number
    longitude: number
  }
  endCoordinates: {
    latitude: number
    longitude: number
  }
}

export interface OptimizedRoute {
  originalAddresses: string[]
  optimizedAddresses: string[]
  segments: RouteSegment[]
  summary: {
    totalDistance: number
    totalDuration: number
    estimatedCost: number
    segmentCount: number
  }
}

export interface PackageInfo {
  type: 'standard' | 'fragile' | 'urgent' | 'volumineux'
  weight: number
  dimensions: string
  description?: string
}

export interface CreateSmartDeliveryRequest {
  segments: RouteSegment[]
  packageInfo: PackageInfo
  urgency: 'normal' | 'urgent' | 'express'
  specialInstructions?: string
  preferredTimeSlots?: string[]
}

export interface PartialDelivery {
  id: number
  pickupLocation: string
  dropoffLocation: string
  status: string
  estimatedCost: number
  urgency: 'normal' | 'urgent' | 'express'
  specialInstructions?: string
  distanceFromLivreur?: number
  totalDistance?: number
  estimatedDuration?: number
  startCoordinates?: {
    latitude: number
    longitude: number
  }
  endCoordinates?: {
    latitude: number
    longitude: number
  }
  client: {
    id: number
    user: {
      nom: string
      prenom: string
      email: string
    }
  }
  annonce: {
    id: number
    titre: string
    description: string
    typeColis: string
    poidsColis: number
    dimensionsColis: string
    dateExpedition: string
    dateLivraison: string
  }
  createdAt: string
}

export interface AvailableDeliveriesResponse {
  data: PartialDelivery[]
  meta: {
    total: number
    livreurPosition?: {
      latitude: number
      longitude: number
    }
    searchRadius: number
  }
}

export interface AcceptSegmentRequest {
  deliveryId: number
  segmentId: string
}

class SmartPartialDeliveryService {
  /**
   * Rechercher des suggestions d'adresses
   */

  async searchAddresses(query: string, limit: number = 10): Promise<ApiResponse<AddressSuggestion[]>> {
    return apiClient.get(API_ROUTES.SMART_PARTIAL_DELIVERIES.SEARCH_ADDRESSES, {
      query,
      limit
    })
  }

  /**
   * Créer un trajet optimisé
   */
  async createOptimizedRoute(
    addresses: string[],
    transportMode: string = 'delivery',
    packageInfo?: PackageInfo
  ): Promise<ApiResponse<OptimizedRoute>> {
    return apiClient.post(API_ROUTES.SMART_PARTIAL_DELIVERIES.CREATE_OPTIMIZED_ROUTE, {
      addresses,
      transportMode,
      packageInfo
    })
  }

  /**
   * Créer une livraison partielle intelligente
   */
  async createSmartPartialDelivery(data: CreateSmartDeliveryRequest): Promise<ApiResponse<any>> {
    return apiClient.post(API_ROUTES.SMART_PARTIAL_DELIVERIES.CREATE_SMART, data)
  }

  /**
   * Obtenir les livraisons partielles disponibles pour un livreur
   */
  async getAvailablePartialDeliveries(
    latitude?: number,
    longitude?: number,
    radius: number = 20
  ): Promise<ApiResponse<AvailableDeliveriesResponse>> {
    const params: any = { radius }
    
    if (latitude !== undefined && longitude !== undefined) {
      params.latitude = latitude
      params.longitude = longitude
    }

    return apiClient.get(API_ROUTES.SMART_PARTIAL_DELIVERIES.AVAILABLE_FOR_LIVREUR, params)
  }

  /**
   * Accepter un segment de livraison partielle
   */
  async acceptPartialDeliverySegment(data: AcceptSegmentRequest): Promise<ApiResponse<any>> {
    return apiClient.post(API_ROUTES.SMART_PARTIAL_DELIVERIES.ACCEPT_SEGMENT, data)
  }

  /**
   * Calculer la distance entre deux points (formule de Haversine)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371 // Rayon de la Terre en kilomètres
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Convertir des degrés en radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * Formater une durée en minutes vers un format lisible
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    return `${hours}h ${remainingMinutes}min`
  }

  /**
   * Formater une date ISO vers un format français
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Obtenir la couleur d'un badge selon l'urgence
   */
  getUrgencyColor(urgency: string): string {
    switch (urgency) {
      case 'express':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'urgent':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    }
  }

  /**
   * Obtenir la position actuelle de l'utilisateur
   */
  getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La géolocalisation n\'est pas supportée'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  /**
   * Valider une adresse (vérification basique)
   */
  validateAddress(address: string): boolean {
    return address.trim().length >= 5
  }

  /**
   * Valider les informations d'un colis
   */
  validatePackageInfo(packageInfo: PackageInfo): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!packageInfo.type) {
      errors.push('Le type de colis est requis')
    }

    if (!packageInfo.weight || packageInfo.weight <= 0) {
      errors.push('Le poids doit être supérieur à 0')
    }

    if (packageInfo.weight > 30) {
      errors.push('Le poids ne peut pas dépasser 30 kg pour une livraison partielle')
    }

    if (!packageInfo.dimensions || packageInfo.dimensions.trim().length === 0) {
      errors.push('Les dimensions sont requises')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Estimer le coût d'une livraison partielle
   */
  estimateDeliveryCost(
    totalDistance: number,
    totalDuration: number,
    packageInfo: PackageInfo,
    urgency: string,
    segmentCount: number
  ): number {
    const baseRate = 2.5 // €/km
    const timeRate = 0.3 // €/min
    const minimumPrice = 8 // € minimum

    let cost = totalDistance * baseRate + totalDuration * timeRate

    // Majoration pour les colis spéciaux
    switch (packageInfo.type) {
      case 'fragile':
        cost *= 1.2
        break
      case 'urgent':
        cost *= 1.4
        break
      case 'volumineux':
        cost *= 1.3
        break
    }

    // Majoration pour l'urgence
    switch (urgency) {
      case 'urgent':
        cost *= 1.2
        break
      case 'express':
        cost *= 1.5
        break
    }

    // Majoration pour les livraisons partielles (complexité)
    if (segmentCount > 2) {
      cost *= 1.1 + (segmentCount - 2) * 0.05
    }

    return Math.max(minimumPrice, Math.round(cost * 100) / 100)
  }
}

export const smartPartialDeliveryService = new SmartPartialDeliveryService()
export default smartPartialDeliveryService