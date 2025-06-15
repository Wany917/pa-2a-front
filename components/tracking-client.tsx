"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Package, MapPin, Clock, CheckCircle, AlertCircle, ArrowRight, Loader2, Truck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-context"
import { clientService } from "@/services/clientService"
import type { Livraison, Colis } from "@/types/api"

export default function TrackingClient() {
  const { t } = useLanguage()
  const router = useRouter()
  const [trackingId, setTrackingId] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [recentLivraisons, setRecentLivraisons] = useState<Livraison[]>([])
  const [recentColis, setRecentColis] = useState<Colis[]>([])

  useEffect(() => {
    loadRecentActivity()
  }, [])

  const loadRecentActivity = async () => {
    try {
      setLoading(true);
      console.log('Chargement de l\'activité récente (livraisons + colis)...');
      
      // Charger les livraisons et colis en parallèle
      const [livraisonsResponse, colisResponse] = await Promise.all([
        clientService.getMyLivraisons(),
        clientService.getMyColis()
      ]);
      
      console.log('Réponse livraisons:', livraisonsResponse);
      console.log('Réponse colis:', colisResponse);
      
      let livraisons: Livraison[] = [];
      let colis: Colis[] = [];
      
      // Traiter les livraisons
      if (livraisonsResponse.success && livraisonsResponse.data) {
        if (Array.isArray(livraisonsResponse.data)) {
          livraisons = livraisonsResponse.data;
        }
      }
      
      // Traiter les colis
      if (colisResponse.success && colisResponse.data) {
        if (Array.isArray(colisResponse.data)) {
          colis = colisResponse.data;
          console.log('📦 Données colis reçues:', colis);
          // Vérifier si les tracking_number sont présents
          colis.forEach((c, index) => {
            console.log(`📦 Colis ${index}:`, {
              id: c.id,
              tracking_number: c.tracking_number,
              status: c.status
            });
          });
        }
      }
      
      // Trier les livraisons par date de création
      const sortedLivraisons = livraisons
        .filter(item => {
          const dateStr = (item as any).created_at || (item as any).createdAt;
          return dateStr && !isNaN(new Date(dateStr).getTime());
        })
        .sort((a, b) => {
          const dateA = new Date((a as any).created_at || (a as any).createdAt).getTime();
          const dateB = new Date((b as any).created_at || (b as any).createdAt).getTime();
          return dateB - dateA;
        });
      
      // Trier les colis par date de création
      const sortedColis = colis
        .filter(item => {
          const dateStr = (item as any).created_at || (item as any).createdAt;
          return dateStr && !isNaN(new Date(dateStr).getTime());
        })
        .sort((a, b) => {
          const dateA = new Date((a as any).created_at || (a as any).createdAt).getTime();
          const dateB = new Date((b as any).created_at || (b as any).createdAt).getTime();
          return dateB - dateA;
        });
      
      setRecentLivraisons(sortedLivraisons);
      setRecentColis(sortedColis);
      
      console.log('Activité récente chargée:', {
        livraisons: sortedLivraisons.length,
        colis: sortedColis.length
      });
      
    } catch (err) {
      console.error('Erreur lors du chargement de l\'activité:', err);
      // Réinitialiser les états en cas d'erreur
      setRecentLivraisons([]);
      setRecentColis([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingId.trim()) {
      setError(t("tracking.pleaseEnterTrackingId"))
      return
    }

    try {
      setError("")
      console.log('Recherche de suivi pour:', trackingId)

      // Déterminer le type d'identifiant et rediriger
      if (trackingId.startsWith('COLIS-')) {
        // C'est un numéro de colis
        console.log('Redirection vers tracking colis:', trackingId)
        router.push(`/app_client/tracking/colis/${trackingId}`)
      } else {
        // Essayer de convertir en ID numérique pour les livraisons
        const livraisonId = parseInt(trackingId)
        if (!isNaN(livraisonId)) {
          console.log('Redirection vers tracking livraison:', livraisonId)
          router.push(`/app_client/tracking/livraison/${livraisonId}`)
        } else {
          // Fallback: rediriger vers la route générique
          console.log('Redirection vers tracking générique:', trackingId)
          router.push(`/app_client/tracking/${trackingId}`)
        }
      }
    } catch (err) {
      console.error('Erreur lors du tracking:', err)
      setError("Erreur lors de la recherche. Veuillez réessayer.")
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'completed': t("tracking.delivered"),
      'in_progress': t("tracking.inTransit"),
      'scheduled': "Programmée",
      'cancelled': "Annulée",
      'pending': "En attente"
    }
    return statusMap[status] || "En attente"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="bg-green-100 p-2 rounded-full mr-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        )
      case 'in_progress':
        return (
          <div className="bg-blue-100 p-2 rounded-full mr-4">
            <Truck className="h-6 w-6 text-blue-600" />
          </div>
        )
      default:
        return (
          <div className="bg-yellow-100 p-2 rounded-full mr-4">
            <Package className="h-6 w-6 text-yellow-600" />
          </div>
        )
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date non disponible"
    
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })
    } catch {
      return "Date invalide"
    }
  }

  const getLivraisonDisplayData = (livraison: Livraison) => {
    // Adapter les propriétés selon la structure réelle des données
    const livraisonData = livraison as any
    
    return {
      pickupLocation: livraisonData.pickup_location || 
                     livraisonData.pickupLocation || 
                     livraisonData.startingAddress || 
                     "Adresse de départ",
      
      dropoffLocation: livraisonData.dropoff_location || 
                      livraisonData.dropoffLocation || 
                      livraisonData.destinationAddress || 
                      "Adresse de destination",
      
      createdAt: livraisonData.created_at || 
                livraisonData.createdAt || 
                new Date().toISOString(),
      
      deliveryTime: livraisonData.delivery_time || 
                   livraisonData.deliveryTime || 
                   livraisonData.scheduled_date,
      
      estimatedDeliveryTime: livraisonData.estimated_delivery_time || 
                            livraisonData.estimatedDeliveryTime ||
                            livraisonData.scheduled_date
    }
  }

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
          <h1 className="text-2xl sm:text-3xl font-semibold text-center text-green-500 mb-8">
            {t("tracking.trackYourPackage")}
          </h1>

          {/* Formulaire de recherche */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("tracking.trackingId")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="trackingId"
                    value={trackingId}
                    onChange={(e) => {
                      setTrackingId(e.target.value)
                      setError("")
                    }}
                    placeholder="Ex: COLIS-123456 ou 123"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                {t("tracking.trackPackage")}
              </button>
            </form>
          </div>

          {/* Livraisons récentes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Mes Livraisons</h2>
              <button
                onClick={loadRecentActivity}
                className="text-green-500 hover:text-green-600 text-sm"
                disabled={loading}
              >
                {loading ? "Chargement..." : "Actualiser"}
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                <span className="ml-2 text-gray-600">Chargement...</span>
              </div>
            ) : recentLivraisons.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Aucune livraison trouvée</p>
                <Link 
                  href="/app_client/announcements"
                  className="mt-2 inline-block text-green-500 hover:text-green-600"
                >
                  Créer une annonce pour commencer
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLivraisons.slice(0, 3).map((livraison) => {
                  const displayData = getLivraisonDisplayData(livraison);
                  
                  return (
                    <Link
                      key={`livraison-${livraison.id}`}
                      href={`/app_client/tracking/livraison/${livraison.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(livraison.status)}
                          <div>
                            <p className="font-medium">Livraison #{livraison.id}</p>
                            <p className="text-sm text-gray-500">
                              {getStatusText(livraison.status)}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">{t("tracking.from")}</p>
                          <p className="font-medium truncate" title={displayData.pickupLocation}>
                            {displayData.pickupLocation}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">{t("tracking.to")}</p>
                          <p className="font-medium truncate" title={displayData.dropoffLocation}>
                            {displayData.dropoffLocation}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">
                            {livraison.status === 'completed' ? 'Livrée le' : 'Créée le'}
                          </p>
                          <p className="font-medium">
                            {livraison.status === 'completed' && displayData.deliveryTime
                              ? formatDate(displayData.deliveryTime)
                              : formatDate(displayData.createdAt)
                            }
                          </p>
                        </div>
                      </div>

                      {displayData.estimatedDeliveryTime && livraison.status === 'in_progress' && (
                        <div className="mt-2 text-sm">
                          <span className="text-blue-600">
                            Livraison estimée: {formatDate(displayData.estimatedDeliveryTime)}
                          </span>
                        </div>
                      )}

                      {livraison.cost && (
                        <div className="mt-2 text-right">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {livraison.cost}€
                          </span>
                        </div>
                      )}
                    </Link>
                  );
                })}
                {recentLivraisons.length > 3 && (
                  <div className="text-center pt-4">
                    <Link 
                      href="/app_client/tracking/livraisons"
                      className="text-green-500 hover:text-green-600 text-sm"
                    >
                      Voir toutes les livraisons ({recentLivraisons.length})
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Colis récents */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Mes Colis</h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                <span className="ml-2 text-gray-600">Chargement...</span>
              </div>
            ) : recentColis.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Aucun colis trouvé</p>
                <Link 
                  href="/app_client/announcements"
                  className="mt-2 inline-block text-green-500 hover:text-green-600"
                >
                  Créer une annonce pour commencer
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentColis.slice(0, 3).map((colis) => {
                  // Vérifier que le tracking_number existe
                  if (!colis.tracking_number) {
                    console.warn('Colis sans tracking_number:', colis);
                    return null;
                  }
                  
                  return (
                    <Link
                      key={`colis-${colis.id}`}
                      href={`/app_client/tracking/colis/${colis.tracking_number}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-primary/10 p-2 rounded-full mr-4">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Colis {colis.tracking_number || 'N/A'}</p>
                            <p className="text-sm text-gray-500">
                              {getStatusText(colis.status)}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Contenu</p>
                          <p className="font-medium truncate" title={(colis as any).content_description || 'Colis'}>
                            {(colis as any).content_description || 'Colis'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Poids</p>
                          <p className="font-medium">
                            {(colis as any).weight || 'N/A'} kg
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Créé le</p>
                          <p className="font-medium">
                            {formatDate((colis as any).created_at || (colis as any).createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 text-right">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Colis
                        </span>
                      </div>
                    </Link>
                  );
                })}
                {recentColis.length > 3 && (
                  <div className="text-center pt-4">
                    <Link 
                      href="/app_client/tracking/colis"
                      className="text-green-500 hover:text-green-600 text-sm"
                    >
                      Voir tous les colis ({recentColis.length})
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2025 EcoDeli. {t("common.allRightsReserved")}</p>
        </div>
      </footer>
    </div>
  )
}