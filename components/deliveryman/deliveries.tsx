"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Search,
  Package,
  PartyPopper,
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import DeliverymanLayout from "./layout"

// Type pour les livraisons
interface Delivery {
  id: string | number
  image?: string
  announceName?: string
  whereTo?: string
  price?: string
  amount?: number
  deliveryDate?: string
  status: "paid" | "in_transit" | "delivered" | "pending"
  isPriority?: boolean
  annonceId?: number
  livreurId?: number
  adresseLivraison?: string
  colis?: any
}

export default function DeliverymanDeliveries() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Récupérer les livraisons du livreur
  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true)
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
        if (!token) {
          setError("Vous devez être connecté")
          setLoading(false)
          return
        }

        // D'abord récupérer les informations de l'utilisateur connecté
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        })

        if (!userResponse.ok) {
          throw new Error('Erreur lors de la récupération des informations utilisateur')
        }

        const userData = await userResponse.json()
        const livreurId = userData.id

        // Ensuite récupérer les livraisons associées à ce livreur
        // Note: L'API devrait avoir un endpoint pour cela
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/livraisons/livreur/${livreurId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des livraisons')
        }

        const data = await response.json()
        
        // Transformer les données pour correspondre à notre interface
        const formattedDeliveries = await Promise.all(data.map(async (livraison: any) => {
          // Pour chaque livraison, récupérer les détails de l'annonce associée
          let annonceData: any = {}
          
          try {
            const annonceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/annonces/${livraison.annonceId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              credentials: 'include'
            })
            
            if (annonceResponse.ok) {
              annonceData = await annonceResponse.json()
            }
          } catch (error) {
            console.error("Erreur lors de la récupération de l'annonce:", error)
          }
          
          // Cartographier le statut de l'API vers notre interface
          let status: "paid" | "in_transit" | "delivered" | "pending" = "pending"
          switch(livraison.statut) {
            case "en_attente":
              status = "pending"
              break
            case "en_cours":
              status = "in_transit"
              break
            case "livré":
              status = "delivered"
              break
            case "payé":
              status = "paid"
              break
          }
          
          return {
            id: livraison.id,
            annonceId: livraison.annonceId,
            livreurId: livraison.livreurId,
            announceName: annonceData.titre || "Livraison sans titre",
            image: annonceData.image || "/placeholder.svg",
            whereTo: annonceData.adresseLivraison || livraison.adresseLivraison || "Adresse non spécifiée",
            price: annonceData.prix ? `€${annonceData.prix}` : "Prix non spécifié",
            amount: annonceData.quantite || 1,
            deliveryDate: formatDate(livraison.dateLivraison || annonceData.dateRetraitFin),
            status: status,
            isPriority: annonceData.estPrioritaire || false,
            adresseLivraison: livraison.adresseLivraison,
            colis: livraison.colis
          }
        }))

        setDeliveries(formattedDeliveries)
      } catch (error) {
        console.error("Erreur lors de la récupération des livraisons:", error)
        setError("Impossible de charger les livraisons")
      } finally {
        setLoading(false)
      }
    }

    fetchDeliveries()
  }, [])

  // Fonction utilitaire pour formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date non spécifiée"
    
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Filtrer les livraisons en fonction de la recherche
  const filteredDeliveries = deliveries.filter((delivery) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      (delivery.announceName?.toLowerCase().includes(query) || false) ||
      (delivery.whereTo?.toLowerCase().includes(query) || false) ||
      (delivery.price?.toLowerCase().includes(query) || false) ||
      (delivery.deliveryDate?.toLowerCase().includes(query) || false)
    )
  })

  // Fonction pour obtenir la classe CSS du statut
  const getStatusClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-300 text-green-800"
      case "in_transit":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Fonction pour obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return t("deliveryman.deliveriess.paid")
      case "in_transit":
        return t("deliveryman.deliveriess.inTransit")
      case "delivered":
        return t("deliveryman.deliveriess.delivered")
      case "pending":
        return t("deliveryman.deliveriess.pending")
      default:
        return status
    }
  }

  return (
    <DeliverymanLayout>
      {/* Page content */}
      <main className="p-4 lg:p-6">
        <h1 className="mb-6 text-2xl font-bold">{t("deliveryman.deliveries")}</h1>

        {/* Mobile search bar */}
        <div className="mb-6 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 mb-8 mt-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            {error}
          </div>
        ) : (
          /* Deliveries Table */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("deliveryman.deliveriess.image")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("deliveryman.deliveriess.announceName")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("deliveryman.deliveriess.whereTo")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("deliveryman.deliveriess.price")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("deliveryman.deliveriess.amount")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("deliveryman.deliveriess.deliveryDate")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("deliveryman.deliveriess.status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDeliveries.length > 0 ? (
                    filteredDeliveries.map((delivery) => (
                      <tr 
                        key={delivery.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => window.location.href = `/app_deliveryman/delivery/${delivery.id}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <Image
                              src={delivery.image || "/placeholder.svg"}
                              alt={delivery.announceName || "Delivery image"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {delivery.announceName}
                              {delivery.isPriority && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {t("deliveryman.priority")}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{delivery.whereTo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {delivery.price}
                            {delivery.isPriority && (
                              <span className="ml-1 text-xs text-red-600">(+{t("deliveryman.priorityFee")})</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{delivery.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{delivery.deliveryDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(delivery.status)}`}
                          >
                            {getStatusText(delivery.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        {t("deliveryman.deliveriess.noDeliveriesFound")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </DeliverymanLayout>
  )
}