'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MapPin, 
  Clock, 
  Package, 
  Navigation, 
  RefreshCw, 
  Filter,
  User,
  Euro,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Truck
} from 'lucide-react'
import { toast } from 'sonner'
import { useApiCall } from '@/hooks/use-api-call'
import { smartPartialDeliveryService } from '@/services/smart-partial-delivery-service'
import type {
  PartialDelivery,
  AvailableDeliveriesResponse,
  AcceptSegmentRequest
} from '@/services/smart-partial-delivery-service'

interface LivreurPosition {
  latitude: number
  longitude: number
}

const LivreurPartialDeliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<PartialDelivery[]>([])
  const [livreurPosition, setLivreurPosition] = useState<LivreurPosition | null>(null)
  const [searchRadius, setSearchRadius] = useState(20)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [acceptingDeliveryId, setAcceptingDeliveryId] = useState<number | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [totalAvailable, setTotalAvailable] = useState(0)
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'urgency'>('distance')
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'normal' | 'urgent' | 'express'>('all')

  // Hook pour récupérer les livraisons disponibles
  const { execute: fetchAvailableDeliveries, loading: loadingDeliveries } = useApiCall({
    apiCall: (params?: any) => smartPartialDeliveryService.getAvailablePartialDeliveries(
      params.latitude,
      params.longitude,
      params.radius
    ),
    onSuccess: (data) => {
      let deliveriesData = data.data || []
      setTotalAvailable(data.meta?.total || deliveriesData.length)
      
      // Filtrer par urgence
      if (filterUrgency !== 'all') {
        deliveriesData = deliveriesData.filter(d => d.urgency === filterUrgency)
      }
      
      // Trier les livraisons
      deliveriesData.sort((a, b) => {
        switch (sortBy) {
          case 'distance':
            return (a.distanceFromLivreur || 0) - (b.distanceFromLivreur || 0)
          case 'price':
            return b.estimatedCost - a.estimatedCost
          case 'urgency':
            const urgencyOrder = { express: 3, urgent: 2, normal: 1 }
            return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
          default:
            return 0
        }
      })
      
      setDeliveries(deliveriesData)
      setLastRefresh(new Date())
      if (data.meta?.livreurPosition) {
        setLivreurPosition(data.meta.livreurPosition)
      }
    },
    onError: (error) => {
      toast.error('Erreur lors du chargement des livraisons')
      console.error(error)
    }
  })

  // Hook pour accepter une livraison
  const { execute: acceptDelivery } = useApiCall({
    apiCall: (data: any) => smartPartialDeliveryService.acceptPartialDeliverySegment(data),
    onSuccess: (data) => {
      toast.success('Livraison acceptée avec succès! Le client a été notifié.')
      // Retirer la livraison de la liste
      setDeliveries(prev => prev.filter(d => d.id !== acceptingDeliveryId))
      setAcceptingDeliveryId(null)
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'acceptation de la livraison')
      console.error(error)
      setAcceptingDeliveryId(null)
    }
  })

  // Obtenir la position du livreur
  const getCurrentLocation = useCallback(async () => {
    setIsLoadingLocation(true)
    try {
      const position = await smartPartialDeliveryService.getCurrentPosition()
      setLivreurPosition(position)
      
      // Recharger les livraisons avec la nouvelle position
      fetchAvailableDeliveries({
        latitude: position.latitude,
        longitude: position.longitude,
        radius: searchRadius
      })
      
      toast.success('Position mise à jour')
    } catch (error) {
      console.error('Erreur de géolocalisation:', error)
      toast.error('Impossible d\'obtenir votre position')
    } finally {
      setIsLoadingLocation(false)
    }
  }, [fetchAvailableDeliveries, searchRadius])

  // Rafraîchir les livraisons
  const refreshDeliveries = useCallback(() => {
    setIsRefreshing(true)
    const params = livreurPosition ? {
      latitude: livreurPosition.latitude,
      longitude: livreurPosition.longitude,
      radius: searchRadius
    } : undefined
    
    fetchAvailableDeliveries(params).finally(() => {
      setIsRefreshing(false)
    })
  }, [livreurPosition, searchRadius, fetchAvailableDeliveries])

  // Accepter une livraison
  const handleAcceptDelivery = (deliveryId: number) => {
    setAcceptingDeliveryId(deliveryId)
    const acceptData = {
      deliveryId,
      segmentId: `segment_${deliveryId}_1` // ID temporaire pour le segment
    }
    acceptDelivery(acceptData)
  }

  // Formater la durée
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    return `${hours}h ${remainingMinutes}min`
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Obtenir la couleur du badge d'urgence
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'express':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'urgent':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    }
  }

  // Charger les livraisons au montage du composant
  useEffect(() => {
    getCurrentLocation()
  }, [getCurrentLocation])

  // Recharger quand les filtres changent
  useEffect(() => {
    if (livreurPosition) {
      fetchAvailableDeliveries({
        latitude: livreurPosition.latitude,
        longitude: livreurPosition.longitude,
        radius: searchRadius
      })
    }
  }, [sortBy, filterUrgency, searchRadius, livreurPosition, fetchAvailableDeliveries])

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (livreurPosition && !loadingDeliveries) {
        refreshDeliveries()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [livreurPosition, loadingDeliveries, refreshDeliveries])

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="h-8 w-8" />
            Livraisons Partielles Disponibles
            {totalAvailable > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalAvailable} disponible{totalAvailable > 1 ? 's' : ''}
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {deliveries.length} livraison{deliveries.length !== 1 ? 's' : ''} affichée{deliveries.length !== 1 ? 's' : ''}
            {lastRefresh && (
              <span className="block text-xs text-muted-foreground mt-1">
                Dernière mise à jour : {smartPartialDeliveryService.formatDate(lastRefresh.toISOString())}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {isLoadingLocation ? 'Localisation...' : 'Ma position'}
          </Button>
          
          <Button
            variant="outline"
            onClick={refreshDeliveries}
            disabled={isRefreshing || loadingDeliveries}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres de recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search-radius">Rayon de recherche (km)</Label>
              <Input
                id="search-radius"
                type="number"
                min="1"
                max="100"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value) || 20)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="sort-by">Trier par</Label>
              <Select value={sortBy} onValueChange={(value: 'distance' | 'price' | 'urgency') => setSortBy(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="price">Prix (décroissant)</SelectItem>
                  <SelectItem value="urgency">Urgence</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-urgency">Filtrer par urgence</Label>
              <Select value={filterUrgency} onValueChange={(value: 'all' | 'normal' | 'urgent' | 'express') => setFilterUrgency(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {livreurPosition && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <Label>Position actuelle</Label>
                <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                  {livreurPosition.latitude.toFixed(4)}, {livreurPosition.longitude.toFixed(4)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      {deliveries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {deliveries.length}
            </div>
            <div className="text-xs text-muted-foreground">Livraisons affichées</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {deliveries.reduce((sum, d) => sum + d.estimatedCost, 0).toFixed(0)} €
            </div>
            <div className="text-xs text-muted-foreground">Revenus potentiels</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {deliveries.filter(d => d.urgency === 'urgent' || d.urgency === 'express').length}
            </div>
            <div className="text-xs text-muted-foreground">Livraisons urgentes</div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {deliveries.length > 0 ? (deliveries.reduce((sum, d) => sum + (d.distanceFromLivreur || 0), 0) / deliveries.length).toFixed(1) : '0'} km
            </div>
            <div className="text-xs text-muted-foreground">Distance moyenne</div>
          </div>
        </div>
      )}

      {/* Liste des livraisons */}
      {loadingDeliveries ? (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des livraisons...</p>
        </div>
      ) : deliveries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucune livraison disponible
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filterUrgency !== 'all' ? (
                <>Aucune livraison {filterUrgency} dans votre zone</>
              ) : (
                <>Il n'y a actuellement aucune livraison partielle disponible dans votre zone.</>
              )}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deliveries.map((delivery) => (
            <Card key={delivery.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {delivery.annonce.titre}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {delivery.annonce.description}
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={smartPartialDeliveryService.getUrgencyColor(delivery.urgency)}>
                      {delivery.urgency === 'express' ? 'Express' : 
                       delivery.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                    </Badge>
                    
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {delivery.estimatedCost}€
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Informations du trajet */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">Départ</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {delivery.pickupLocation}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="text-sm font-medium">Arrivée</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {delivery.dropoffLocation}
                      </div>
                    </div>
                  </div>
                  
                  {delivery.distanceFromLivreur && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-500" />
                      <div>
                        <div className="text-sm font-medium">Distance de vous</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {delivery.distanceFromLivreur.toFixed(1)} km
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Informations du colis */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <Package className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                    <div className="text-sm font-medium">{delivery.annonce.typeColis}</div>
                  </div>
                  
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-sm font-medium">{delivery.annonce.poidsColis} kg</div>
                    <div className="text-xs text-gray-500">Poids</div>
                  </div>
                  
                  {delivery.totalDistance && (
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-sm font-medium">{delivery.totalDistance.toFixed(1)} km</div>
                      <div className="text-xs text-gray-500">Distance totale</div>
                    </div>
                  )}
                  
                  {delivery.estimatedDuration && (
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <Clock className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                      <div className="text-sm font-medium">{smartPartialDeliveryService.formatDuration(delivery.estimatedDuration)}</div>
                      <div className="text-xs text-gray-500">Durée estimée</div>
                    </div>
                  )}
                </div>
                
                {/* Informations du client */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium">
                      {delivery.client.user.first_name} {delivery.client.user.last_name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Client depuis {smartPartialDeliveryService.formatDate(delivery.createdAt)}
                    </div>
                  </div>
                </div>
                
                {/* Instructions spéciales */}
                {delivery.specialInstructions && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                        Instructions spéciales
                      </div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        {delivery.specialInstructions}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Expédition souhaitée :</span>
                    <br />
                    {smartPartialDeliveryService.formatDate(delivery.annonce.dateExpedition)}
                  </div>
                  <div>
                    <span className="font-medium">Livraison souhaitée :</span>
                    <br />
                    {smartPartialDeliveryService.formatDate(delivery.annonce.dateLivraison)}
                  </div>
                </div>
                
                {/* Bouton d'acceptation */}
                <Button
                  onClick={() => handleAcceptDelivery(delivery.id)}
                  disabled={acceptingDeliveryId === delivery.id}
                  className="w-full"
                  size="lg"
                >
                  {acceptingDeliveryId === delivery.id ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  {acceptingDeliveryId === delivery.id ? 'Acceptation...' : 'Accepter cette livraison'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default LivreurPartialDeliveries