'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Plus, Trash2, Route, Package, Clock, Euro, AlertCircle, Search, Navigation } from 'lucide-react'
import { useApiCall } from '@/hooks/use-api-call'
import { toast } from 'sonner'
import { smartPartialDeliveryService } from '@/services/smart-partial-delivery-service'
import apiClient from '@/config/api'
import { API_ROUTES } from '@/config/routes'
import type {
  AddressSuggestion,
  RouteSegment,
  OptimizedRoute,
  PackageInfo,
  CreateSmartDeliveryRequest
} from '@/services/smart-partial-delivery-service'

interface AddressSuggestion {
  label: string
  value: string
  coordinates: {
    latitude: number
    longitude: number
  }
  context: string
}

interface RouteSegment {
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

interface OptimizedRoute {
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

interface PackageInfo {
  type: 'standard' | 'fragile' | 'urgent' | 'volumineux'
  weight: number
  dimensions: string
  description?: string
}

const SmartPartialDelivery: React.FC = () => {
  const [addresses, setAddresses] = useState<string[]>(['', ''])
  const [packageInfo, setPackageInfo] = useState<PackageInfo>({
    type: 'standard',
    weight: 1,
    dimensions: '',
    description: ''
  })
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'express'>('normal')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [preferredTimeSlots, setPreferredTimeSlots] = useState<string[]>([])
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null)
  const [addressSuggestions, setAddressSuggestions] = useState<{ [key: number]: AddressSuggestion[] }>({})
  const [showSuggestions, setShowSuggestions] = useState<{ [key: number]: boolean }>({})
  const [searchQueries, setSearchQueries] = useState<{ [key: number]: string }>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Obtenir la position actuelle
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const position = await smartPartialDeliveryService.getCurrentPosition()
        setCurrentLocation(position)
      } catch (error) {
        console.warn('Impossible d\'obtenir la position actuelle:', error)
      }
    }
    getCurrentLocation()
  }, [])

  // Hook pour la recherche d'adresses
  const { execute: searchAddresses } = useApiCall({
    apiCall: (query: string) => smartPartialDeliveryService.searchAddresses(query, 5),
    onSuccess: (data, index: number) => {
      setAddressSuggestions(prev => ({
        ...prev,
        [index]: data.data || []
      }))
    },
    onError: (error) => {
      console.error('Erreur lors de la recherche d\'adresses:', error)
      toast.error('Erreur lors de la recherche d\'adresses')
    }
  })

  // Hook pour l'optimisation de trajet
  const { execute: optimizeRoute } = useApiCall({
    apiCall: (data: any) => apiClient.post(API_ROUTES.SMART_PARTIAL_DELIVERIES.CREATE_OPTIMIZED_ROUTE, data),
    onSuccess: (data) => {
      setOptimizedRoute(data.data)
      toast.success('Trajet optimisé avec succès!')
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'optimisation du trajet')
      console.error(error)
    }
  })

  // Hook pour la création de livraison partielle
  const { execute: createSmartDelivery } = useApiCall({
    apiCall: (data: any) => apiClient.post(API_ROUTES.SMART_PARTIAL_DELIVERIES.CREATE_SMART, data),
    onSuccess: (data) => {
      toast.success('Livraison partielle créée avec succès!')
      // Réinitialiser le formulaire
      setAddresses(['', ''])
      setOptimizedRoute(null)
      setPackageInfo({ type: 'standard', weight: 1, dimensions: '20x20x20' })
      setUrgency('normal')
      setSpecialInstructions('')
    },
    onError: (error) => {
      toast.error('Erreur lors de la création de la livraison')
      console.error(error)
    }
  })

  // Recherche d'adresses avec debounce
  const handleAddressSearch = useCallback(
    (value: string, index: number) => {
      setSearchQueries(prev => ({ ...prev, [index]: value }))
      
      if (value.length >= 3) {
        searchAddresses(value, index)
      } else {
        setAddressSuggestions(prev => ({
          ...prev,
          [index]: []
        }))
      }
    },
    [searchAddresses]
  )

  // Ajouter une nouvelle adresse
  const addAddress = () => {
    if (addresses.length < 8) { // Limite à 8 adresses
      setAddresses(prev => [...prev, ''])
    } else {
      toast.warning('Maximum 8 adresses autorisées')
    }
  }

  // Supprimer une adresse
  const removeAddress = (index: number) => {
    if (addresses.length > 2) {
      setAddresses(prev => prev.filter((_, i) => i !== index))
      // Nettoyer les suggestions et requêtes associées
      const newSuggestions = { ...addressSuggestions }
      const newQueries = { ...searchQueries }
      delete newSuggestions[index]
      delete newQueries[index]
      setAddressSuggestions(newSuggestions)
      setSearchQueries(newQueries)
    }
  }

  // Ajouter/supprimer un créneau horaire préféré
  const toggleTimeSlot = (timeSlot: string) => {
    setPreferredTimeSlots(prev => 
      prev.includes(timeSlot)
        ? prev.filter(slot => slot !== timeSlot)
        : [...prev, timeSlot]
    )
  }

  // Mettre à jour une adresse
  const updateAddress = (index: number, value: string) => {
    setAddresses(prev => {
      const newAddresses = [...prev]
      newAddresses[index] = value
      return newAddresses
    })
    handleAddressSearch(value, index)
  }

  // Sélectionner une suggestion d'adresse
  const selectAddressSuggestion = (index: number, suggestion: AddressSuggestion) => {
    updateAddress(index, suggestion.label)
    setSearchQueries(prev => ({ ...prev, [index]: suggestion.label }))
    setAddressSuggestions(prev => ({
      ...prev,
      [index]: []
    }))
  }

  // Valider les données avant optimisation
  const validateData = (): boolean => {
    const errors: string[] = []
    
    const validAddresses = addresses.filter(addr => addr.trim().length > 0)
    if (validAddresses.length < 2) {
      errors.push('Veuillez saisir au moins 2 adresses')
    }

    // Valider chaque adresse
    validAddresses.forEach((addr, index) => {
      if (!smartPartialDeliveryService.validateAddress(addr)) {
        errors.push(`L'adresse ${index + 1} est trop courte`)
      }
    })

    // Valider les informations du colis
    const packageValidation = smartPartialDeliveryService.validatePackageInfo(packageInfo)
    if (!packageValidation.isValid) {
      errors.push(...packageValidation.errors)
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  // Optimiser le trajet
  const handleOptimizeRoute = async () => {
    if (!validateData()) {
      toast.error('Veuillez corriger les erreurs avant de continuer')
      return
    }

    const validAddresses = addresses.filter(addr => addr.trim() !== '')

    setIsOptimizing(true)
    try {
      await optimizeRoute({
        addresses: validAddresses,
        transportMode: 'delivery',
        packageInfo
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  // Créer la livraison partielle
  const handleCreateDelivery = async () => {
    if (!optimizedRoute) {
      toast.error('Veuillez d\'abord optimiser le trajet')
      return
    }

    if (!validateData()) {
      toast.error('Veuillez corriger les erreurs avant de continuer')
      return
    }

    setIsCreating(true)
    try {
      const deliveryData: CreateSmartDeliveryRequest = {
        segments: optimizedRoute.segments,
        packageInfo,
        urgency,
        specialInstructions: specialInstructions || undefined,
        preferredTimeSlots: preferredTimeSlots.length > 0 ? preferredTimeSlots : undefined
      }

      await createSmartDelivery(deliveryData)
      
      toast.success('Livraison partielle créée avec succès! Les livreurs ont été notifiés.')
      // Reset form
      setAddresses(['', ''])
      setOptimizedRoute(null)
      setSpecialInstructions('')
      setPreferredTimeSlots([])
      setSearchQueries({})
      setValidationErrors([])
      setPackageInfo({
        type: 'standard',
        weight: 1,
        dimensions: '',
        description: ''
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Formater la durée en minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    return `${hours}h ${remainingMinutes}min`
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Livraison Partielle Intelligente
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Créez votre trajet en saisissant simplement les adresses. Notre système optimisera automatiquement l'itinéraire.
        </p>
      </div>

      {/* Formulaire d'adresses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Adresses du trajet
          </CardTitle>
          <CardDescription>
            Saisissez les adresses de votre trajet. L'ordre sera optimisé automatiquement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {addresses.map((address, index) => (
            <div key={index} className="relative">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Label htmlFor={`address-${index}`}>
                    {index === 0 ? 'Adresse de départ' : index === addresses.length - 1 ? 'Adresse d\'arrivée' : `Étape ${index}`}
                  </Label>
                  <Input
                    id={`address-${index}`}
                    value={address}
                    onChange={(e) => updateAddress(index, e.target.value)}
                    placeholder="Saisissez une adresse..."
                    className="mt-1"
                  />
                  
                  {/* Suggestions d'adresses */}
                  {addressSuggestions[index] && addressSuggestions[index].length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {addressSuggestions[index].map((suggestion, suggestionIndex) => (
                        <button
                          key={suggestionIndex}
                          onClick={() => selectAddressSuggestion(index, suggestion)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <div className="font-medium">{suggestion.label}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{suggestion.context}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {addresses.length > 2 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeAddress(index)}
                    className="mt-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={addAddress}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une étape
          </Button>
          
          <Button
            onClick={handleOptimizeRoute}
            disabled={isOptimizing || addresses.filter(addr => addr.trim() !== '').length < 2}
            className="w-full"
          >
            <Route className="h-4 w-4 mr-2" />
            {isOptimizing ? 'Optimisation en cours...' : 'Optimiser le trajet'}
          </Button>
        </CardContent>
      </Card>

      {/* Informations du colis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Informations du colis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="package-type">Type de colis</Label>
              <Select value={packageInfo.type} onValueChange={(value: any) => setPackageInfo(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="fragile">Fragile</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="volumineux">Volumineux</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="package-weight">Poids (kg)</Label>
              <Input
                id="package-weight"
                type="number"
                min="0.1"
                step="0.1"
                value={packageInfo.weight}
                onChange={(e) => setPackageInfo(prev => ({ ...prev, weight: parseFloat(e.target.value) || 1 }))}
              />
            </div>
            
            <div>
              <Label htmlFor="package-dimensions">Dimensions (cm)</Label>
              <Input
                id="package-dimensions"
                value={packageInfo.dimensions}
                onChange={(e) => setPackageInfo(prev => ({ ...prev, dimensions: e.target.value }))}
                placeholder="L x l x h"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="urgency">Urgence</Label>
            <Select value={urgency} onValueChange={(value: any) => setUrgency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="express">Express</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="special-instructions">Instructions spéciales (optionnel)</Label>
            <Textarea
              id="special-instructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Précisions sur la livraison, horaires préférés, etc."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trajet optimisé */}
      {optimizedRoute && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Trajet optimisé
            </CardTitle>
            <CardDescription>
              Votre trajet a été optimisé pour minimiser la distance et le temps de livraison.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Résumé */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {optimizedRoute.summary.totalDistance} km
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Distance totale</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatDuration(optimizedRoute.summary.totalDuration)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Durée estimée</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {optimizedRoute.summary.segmentCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Segments</div>
              </div>
              
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {optimizedRoute.summary.estimatedCost}€
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Coût estimé</div>
              </div>
            </div>
            
            <Separator />
            
            {/* Segments détaillés */}
            <div className="space-y-3">
              <h4 className="font-semibold">Segments du trajet :</h4>
              {optimizedRoute.segments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      Segment {index + 1}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {segment.startAddress} → {segment.endAddress}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline">
                      {segment.distance} km
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(segment.estimatedDuration)}
                    </Badge>
                    <Badge variant="outline">
                      {segment.estimatedCost}€
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              onClick={handleCreateDelivery}
              disabled={isCreating}
              className="w-full"
              size="lg"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {isCreating ? 'Création en cours...' : 'Créer la livraison partielle'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SmartPartialDelivery