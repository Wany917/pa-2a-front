'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Package, Route, Clock, CheckCircle, AlertCircle, Navigation, Zap } from 'lucide-react'
import { PartialDeliveryService } from '@/services/partial-delivery.service'
import { livreurService } from '@/services/livreurService'
import { toast } from 'sonner'
import { Livraison } from '@/types/api'

interface SmartSegment {
  id: string
  startAddress: string
  endAddress: string
  startCoordinates: { latitude: number; longitude: number }
  endCoordinates: { latitude: number; longitude: number }
  distance: number
  estimatedDuration: number
  difficulty: 'easy' | 'medium' | 'hard'
  suggestedPrice: number
}

interface OptimizedDelivery {
  livraisonId: number
  originalRoute: {
    start: string
    end: string
    totalDistance: number
  }
  suggestedSegments: SmartSegment[]
  estimatedTotalCost: number
  estimatedTimeReduction: number
}

export default function SmartPartialDeliveryLivreur() {
  const [availableDeliveries, setAvailableDeliveries] = useState<Livraison[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<Livraison | null>(null)
  const [optimizedDelivery, setOptimizedDelivery] = useState<OptimizedDelivery | null>(null)
  const [selectedSegments, setSelectedSegments] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  useEffect(() => {
    loadAvailableDeliveries()
    getCurrentLocation()
  }, [])

  const requestLocationPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      if (permission.state === 'denied') {
        toast.error(
          '🚫 Géolocalisation bloquée définitivement. Pour la réactiver:\n\n' +
          '1️⃣ Cliquez sur l\'icône 🔒 ou ℹ️ à gauche de l\'URL\n' +
          '2️⃣ Sélectionnez "Autoriser" pour la localisation\n' +
          '3️⃣ Rechargez la page\n\n' +
          'Ou allez dans Paramètres > Confidentialité > Localisation',
          { duration: 15000 }
        )
        return false
      }
      return true
    } catch (error) {
      console.warn('Impossible de vérifier les permissions:', error)
      return true // Continuer quand même
    }
  }

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      console.warn('Géolocalisation non supportée par ce navigateur')
      toast.error('❌ Géolocalisation non disponible sur ce navigateur')
      setCurrentLocation({ latitude: 48.8566, longitude: 2.3522 })
      return
    }

    setLocationLoading(true)
    toast.info('🔍 Recherche de votre position...')

    // Vérifier les permissions d'abord
    const canProceed = await requestLocationPermission()
    if (!canProceed) {
      setCurrentLocation({ latitude: 48.8566, longitude: 2.3522 })
      setLocationLoading(false)
      return
    }

    // Première tentative avec haute précision
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
        setLocationLoading(false)
        
        if (accuracy > 100) {
          toast.warning(`📍 Position obtenue (précision: ${Math.round(accuracy)}m)\n💡 Pour une meilleure précision, activez le GPS et sortez à l'extérieur`)
        } else {
          toast.success(`📍 Position précise obtenue! (±${Math.round(accuracy)}m)`)
        }
      },
      (error) => {
        console.warn('Erreur de géolocalisation haute précision:', error)
        
        // Tentative de fallback avec précision réduite
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            })
            setLocationLoading(false)
            toast.warning('📍 Position approximative obtenue (précision réduite)')
          },
          (fallbackError) => {
            console.warn('Erreur de géolocalisation fallback:', fallbackError)
            setLocationLoading(false)
            
            switch(fallbackError.code) {
              case fallbackError.PERMISSION_DENIED:
                toast.error(
                  '🚫 Permission de géolocalisation refusée\n\n' +
                  '📋 Pour corriger cela:\n' +
                  '1️⃣ Cliquez sur l\'icône 🔒 dans la barre d\'adresse\n' +
                  '2️⃣ Changez "Localisation" de "Bloquer" à "Autoriser"\n' +
                  '3️⃣ Rechargez la page (F5)\n\n' +
                  '💡 Utilisation de la position par défaut (Paris)',
                  { duration: 12000 }
                )
                break
              case fallbackError.POSITION_UNAVAILABLE:
                toast.error('📡 Position GPS indisponible - Vérifiez votre connexion')
                break
              case fallbackError.TIMEOUT:
                toast.error('⏱️ Délai d\'attente GPS dépassé')
                break
              default:
                toast.error('❓ Erreur de géolocalisation inconnue')
                break
            }
            
            // Position par défaut (Paris)
            setCurrentLocation({
              latitude: 48.8566,
              longitude: 2.3522
            })
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000 // 1 minute pour fallback
          }
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0 // Force une nouvelle lecture
      }
    )
  }

  const loadAvailableDeliveries = async () => {
    setLoading(true)
    try {
      const response = await livreurService.getAvailableLivraisons()
      if (response.success && response.data && Array.isArray(response.data)) {
        // Filtrer les livraisons qui peuvent bénéficier de livraisons partielles
        const eligibleDeliveries = response.data.filter((livraison: Livraison) => 
          livraison.status === 'pending' && 
          livraison.adresseDepart && 
          livraison.adresseArrivee
        )
        setAvailableDeliveries(eligibleDeliveries)
      } else {
        // Données de test pour démonstration
        const mockDeliveries: Livraison[] = [
          {
            id: 1,
            status: 'pending',
            amount: 25.50,
            adresseDepart: {
              ville: 'Paris',
              rue: '123 Rue de Rivoli',
              latitude: 48.8566,
              longitude: 2.3522
            },
            adresseArrivee: {
              ville: 'Versailles',
              rue: '45 Avenue de Paris',
              latitude: 48.8014,
              longitude: 2.1301
            }
          },
          {
            id: 2,
            status: 'pending',
            amount: 18.75,
            adresseDepart: {
              ville: 'Lyon',
              rue: '67 Place Bellecour',
              latitude: 45.7640,
              longitude: 4.8357
            },
            adresseArrivee: {
              ville: 'Villeurbanne',
              rue: '89 Cours Emile Zola',
              latitude: 45.7665,
              longitude: 4.8795
            }
          },
          {
            id: 3,
            status: 'pending',
            amount: 32.00,
            adresseDepart: {
              ville: 'Marseille',
              rue: '12 Vieux Port',
              latitude: 43.2965,
              longitude: 5.3698
            },
            adresseArrivee: {
              ville: 'Aix-en-Provence',
              rue: '34 Cours Mirabeau',
              latitude: 43.5263,
              longitude: 5.4454
            }
          }
        ] as Livraison[]
        setAvailableDeliveries(mockDeliveries)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      // En cas d'erreur, utiliser les données de test
      const mockDeliveries: Livraison[] = [
        {
          id: 1,
          status: 'pending',
          amount: 25.50,
          adresseDepart: {
            ville: 'Paris',
            rue: '123 Rue de Rivoli',
            latitude: 48.8566,
            longitude: 2.3522
          },
          adresseArrivee: {
            ville: 'Versailles',
            rue: '45 Avenue de Paris',
            latitude: 48.8014,
            longitude: 2.1301
          }
        }
      ] as Livraison[]
      setAvailableDeliveries(mockDeliveries)
      toast.info('Mode démonstration - Données de test chargées')
    } finally {
      setLoading(false)
    }
  }

  const analyzeDelivery = async (livraison: Livraison) => {
    if (!livraison.adresseDepart || !livraison.adresseArrivee) {
      toast.error('Informations de livraison incomplètes')
      return
    }

    setLoading(true)
    setSelectedDelivery(livraison)

    try {
      // Simulation d'analyse intelligente - à remplacer par l'API réelle
      const mockOptimization: OptimizedDelivery = {
        livraisonId: livraison.id as number,
        originalRoute: {
          start: `${livraison.adresseDepart?.ville || ''} ${livraison.adresseDepart?.rue || ''}`,
          end: `${livraison.adresseArrivee?.ville || ''} ${livraison.adresseArrivee?.rue || ''}`,
          totalDistance: calculateMockDistance(
            `${livraison.adresseDepart?.ville || ''} ${livraison.adresseDepart?.rue || ''}`,
            `${livraison.adresseArrivee?.ville || ''} ${livraison.adresseArrivee?.rue || ''}`
          )
        },
        suggestedSegments: generateMockSegments(livraison),
        estimatedTotalCost: livraison.amount || 0,
        estimatedTimeReduction: 25 // 25% de réduction de temps estimée
      }

      setOptimizedDelivery(mockOptimization)
      toast.success('Analyse terminée ! Segments optimisés générés.')
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error)
      toast.error('Erreur lors de l\'analyse de la livraison')
    } finally {
      setLoading(false)
    }
  }

  const calculateMockDistance = (start: string, end: string): number => {
    // Simulation - à remplacer par un calcul réel
    return Math.floor(Math.random() * 20) + 5 // 5-25 km
  }

  const generateMockSegments = (livraison: Livraison): SmartSegment[] => {
    const segments: SmartSegment[] = []
    const startAddr = `${livraison.adresseDepart?.ville || ''} ${livraison.adresseDepart?.rue || ''}`
    const endAddr = `${livraison.adresseArrivee?.ville || ''} ${livraison.adresseArrivee?.rue || ''}`
    const totalDistance = calculateMockDistance(startAddr, endAddr)
    const segmentCount = Math.floor(totalDistance / 8) + 1 // Un segment tous les ~8km

    for (let i = 0; i < segmentCount; i++) {
      const segmentDistance = totalDistance / segmentCount
      const difficulty = i === 0 ? 'easy' : (i === segmentCount - 1 ? 'medium' : 'easy')
      
      segments.push({
        id: `segment-${i + 1}`,
        startAddress: i === 0 ? startAddr : `Point intermédiaire ${i}`,
        endAddress: i === segmentCount - 1 ? endAddr : `Point intermédiaire ${i + 1}`,
        startCoordinates: {
          latitude: 48.8566 + (Math.random() - 0.5) * 0.1,
          longitude: 2.3522 + (Math.random() - 0.5) * 0.1
        },
        endCoordinates: {
          latitude: 48.8566 + (Math.random() - 0.5) * 0.1,
          longitude: 2.3522 + (Math.random() - 0.5) * 0.1
        },
        distance: segmentDistance,
        estimatedDuration: Math.floor(segmentDistance * 3), // 3 min par km
        difficulty,
        suggestedPrice: Math.floor(segmentDistance * 2.5) // 2.5€ par km
      })
    }

    return segments
  }

  const toggleSegmentSelection = (segmentId: string) => {
    setSelectedSegments(prev => 
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    )
  }

  const createPartialDelivery = async () => {
    if (!optimizedDelivery || selectedSegments.length === 0) {
      toast.error('Veuillez sélectionner au moins un segment')
      return
    }

    setLoading(true)
    try {
      const selectedSegmentData = optimizedDelivery.suggestedSegments.filter(
        segment => selectedSegments.includes(segment.id)
      )

      const segments = selectedSegmentData.map(segment => ({
        startLatitude: segment.startCoordinates.latitude,
        startLongitude: segment.startCoordinates.longitude,
        endLatitude: segment.endCoordinates.latitude,
        endLongitude: segment.endCoordinates.longitude,
        distance: segment.distance
      }))

      const response = await PartialDeliveryService.createPartialDelivery({
        livraisonId: optimizedDelivery.livraisonId,
        segments
      })

      if (response.success) {
        toast.success('Livraison partielle créée avec succès !')
        // Reset
        setSelectedDelivery(null)
        setOptimizedDelivery(null)
        setSelectedSegments([])
        loadAvailableDeliveries()
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast.error('Erreur lors de la création de la livraison partielle')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <CheckCircle className="h-4 w-4" />
      case 'medium': return <Clock className="h-4 w-4" />
      case 'hard': return <AlertCircle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Livraisons Partielles Intelligentes</h1>
          <p className="text-muted-foreground mt-2">
            Analysez et optimisez automatiquement vos livraisons en segments collaboratifs
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium">Mode Smart</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            className="flex items-center space-x-2"
            disabled={locationLoading}
          >
            {locationLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span>{locationLoading ? 'Localisation...' : '📍 Réactiver GPS'}</span>
          </Button>
          {currentLocation && (
            <div className="flex items-center space-x-1 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Position OK</span>
            </div>
          )}
        </div>
      </div>

      {/* Étape 1: Sélection de livraison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Livraisons Disponibles</span>
          </CardTitle>
          <CardDescription>
            Sélectionnez une livraison à analyser pour la segmentation automatique
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !optimizedDelivery ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Chargement des livraisons...</p>
            </div>
          ) : availableDeliveries.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aucune livraison disponible pour la segmentation.
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {availableDeliveries.map((livraison) => (
                  <Card 
                    key={livraison.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedDelivery?.id === livraison.id 
                        ? 'ring-2 ring-indigo-500 bg-indigo-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => analyzeDelivery(livraison)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">
                              {livraison.adresseDepart?.ville} {livraison.adresseDepart?.rue}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <span className="text-sm">
                              {livraison.adresseArrivee?.ville} {livraison.adresseArrivee?.rue}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{livraison.status}</Badge>
                          <p className="text-sm font-medium mt-1">{livraison.amount}€</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Étape 2: Analyse et segments optimisés */}
      {optimizedDelivery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Route className="h-5 w-5" />
              <span>Segments Optimisés</span>
            </CardTitle>
            <CardDescription>
              Sélectionnez les segments que vous souhaitez proposer à d'autres livreurs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Résumé de l'optimisation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{optimizedDelivery.suggestedSegments.length}</p>
                <p className="text-sm text-blue-800">Segments suggérés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{optimizedDelivery.estimatedTimeReduction}%</p>
                <p className="text-sm text-green-800">Gain de temps estimé</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {optimizedDelivery.suggestedSegments.reduce((sum, s) => sum + s.suggestedPrice, 0)}€
                </p>
                <p className="text-sm text-purple-800">Revenus potentiels</p>
              </div>
            </div>

            <Separator />

            {/* Liste des segments */}
            <div className="space-y-3">
              {optimizedDelivery.suggestedSegments.map((segment, index) => (
                <Card 
                  key={segment.id}
                  className={`cursor-pointer transition-all ${
                    selectedSegments.includes(segment.id)
                      ? 'ring-2 ring-indigo-500 bg-indigo-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleSegmentSelection(segment.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">{segment.startAddress}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <span className="text-sm">{segment.endAddress}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getDifficultyColor(segment.difficulty)}>
                            {getDifficultyIcon(segment.difficulty)}
                            <span className="ml-1 capitalize">{segment.difficulty}</span>
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {segment.distance.toFixed(1)} km • {segment.estimatedDuration} min
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {segment.suggestedPrice}€
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                {selectedSegments.length} segment(s) sélectionné(s)
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedDelivery(null)
                    setOptimizedDelivery(null)
                    setSelectedSegments([])
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={createPartialDelivery}
                  disabled={selectedSegments.length === 0 || loading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {loading ? 'Création...' : `Créer ${selectedSegments.length} segment(s)`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations sur la position */}
      {currentLocation && (
        <Alert>
          <Navigation className="h-4 w-4" />
          <AlertDescription>
            Position actuelle détectée: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}