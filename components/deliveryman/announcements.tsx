"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  BarChart3,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Edit,
  BellRing,
  CreditCard,
  User,
  PartyPopper,
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
import DeliverymanLayout from "./layout"

// Type pour les annonces
interface Announcement {
  id: string | number
  title: string
  image?: string
  client?: string
  address?: string
  price?: string
  deliveryDate?: string
  amount?: number
  storageBox?: string
  size?: "Small" | "Medium" | "Large"
  isPriority?: boolean
  description?: string
  utilisateurId?: number
}

export default function DeliverymanAnnouncements() {
  const { t } = useLanguage()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingAccept, setLoadingAccept] = useState<{id: number, loading: boolean}>({ id: 0, loading: false })

  // Récupérer les annonces disponibles
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true)
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
        if (!token) {
          setError("Vous devez être connecté")
          setLoading(false)
          return
        }

        // Ici nous récupérons toutes les annonces qui n'ont pas encore de livraison
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/annonces`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des annonces')
        }

        const data = await response.json()
        
        // Extraire le tableau d'annonces de la réponse
        const annoncesData = data.annonces || []
        
        // Transformer les données pour correspondre à notre interface
        const formattedAnnouncements = annoncesData
          .filter((annonce: any) => annonce.state === 'open') // Ne montrer que les annonces ouvertes
          .map((annonce: any) => ({
            id: annonce.id,
            title: annonce.title || "Annonce sans titre",
            description: annonce.description,
            image: annonce.imagePath ? `${process.env.NEXT_PUBLIC_API_URL}/${annonce.imagePath}` : "/placeholder.svg",
            client: annonce.utilisateur ? `${annonce.utilisateur.firstName} ${annonce.utilisateur.lastName}` : "Client",
            address: annonce.destinationAddress || "Adresse non spécifiée",
            price: `€${annonce.price || 0}`,
            deliveryDate: formatDate(annonce.scheduledDate),
            amount: 1, // Par défaut 1 puisque ce n'est pas dans l'API
            storageBox: annonce.storageBoxId || "Non spécifié",
            size: getSizeFromWeight(5), // Valeur par défaut
            isPriority: annonce.priority,
            utilisateurId: annonce.utilisateurId
          }))

        setAnnouncements(formattedAnnouncements)
      } catch (error) {
        console.error("Erreur lors de la récupération des annonces:", error)
        setError("Impossible de charger les annonces")
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  // Fonction utilitaire pour formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date non spécifiée"
    
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Fonction pour déterminer la taille en fonction du poids
  const getSizeFromWeight = (weight: number) => {
    if (weight <= 1) return "Small"
    if (weight <= 5) return "Medium"
    return "Large"
  }

  // Accepter une livraison
  const handleAcceptDelivery = async (announcementId: number) => {
    setLoadingAccept({ id: announcementId, loading: true })
    
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
      if (!token) {
        alert("Vous devez être connecté pour accepter une livraison")
        return
      }

      // Au lieu d'extraire l'ID du token, utilisons l'API pour obtenir les informations de l'utilisateur
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
      const userId = userData.id

      if (!userId) {
        alert("Impossible de récupérer vos informations d'utilisateur")
        return
      }

      // Nous n'utilisons pas PATCH pour éviter les problèmes de CORS
      // Cette API devrait mettre à jour le statut de l'annonce en "pending" automatiquement
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/annonces/${announcementId}/livraisons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          livreur_id: userId,
          status: 'scheduled',
          pickup_location: "À récupérer",
          dropoff_location: "À livrer"
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la livraison')
      }

      const responseData = await response.json();
      
      alert("Livraison acceptée avec succès! L'annonce n'est plus visible pour les autres livreurs.")
      // Retirer cette annonce de la liste
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId))
      
      // Rediriger vers la page des livraisons
      window.location.href = '/app_deliveryman/deliveries';
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la livraison:", error)
      alert("Impossible d'accepter cette livraison")
    } finally {
      setLoadingAccept({ id: 0, loading: false })
    }
  }

  // Cette fonction n'est plus utilisée, mais on la garde au cas où
  const getUserIdFromToken = (token: string): number | null => {
    try {
      // Cette méthode peut être peu fiable selon le format du token
      // Il est préférable d'utiliser l'API pour obtenir les informations de l'utilisateur
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Format de token invalide');
      }
      
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Décodage Base64 plus sûr
      const rawPayload = atob(base64);
      const payload = JSON.parse(rawPayload);
      
      return payload.id || null;
    } catch (error) {
      console.error("Erreur lors du décodage du token:", error)
      return null;
    }
  }

  return (
    <DeliverymanLayout>
      {/* Page content */}
      <main className="p-4 lg:p-6">
        <h1 className="mb-6 text-2xl font-bold">{t("deliveryman.announcements")}</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            {error}
          </div>
        ) : (
          <>
            {/* Announcements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-48 relative bg-green-200">
                    <Image
                      src={announcement.image || "/placeholder.svg"}
                      alt={announcement.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-lg font-semibold">{announcement.title}</h2>
                      {announcement.isPriority && (
                        <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {t("deliveryman.priority")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">By {announcement.client}</span>
                    </p>
                    <div className="space-y-2 text-sm mb-4">
                      <p>
                        <span className="font-medium">{t("announcements.deliveryAddress")}:</span> {announcement.address}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.priceForDelivery")}:</span> {announcement.price}
                        {announcement.isPriority && (
                          <span className="ml-2 text-red-600 text-xs font-medium">(+{t("deliveryman.priorityFee")})</span>
                        )}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.deliveryDate")}:</span>{" "}
                        {announcement.deliveryDate}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.amount")}:</span> {announcement.amount}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.storageBox")}:</span> {announcement.storageBox}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{announcement.size}</span>
                      <button
                        onClick={() => handleAcceptDelivery(Number(announcement.id))}
                        className={`${
                          announcement.isPriority ? "bg-red-500 hover:bg-red-600" : "bg-green-300 hover:bg-green-400"
                        } px-4 py-2 text-white rounded-md text-sm font-medium`}
                        disabled={loadingAccept.loading && loadingAccept.id === announcement.id}
                      >
                        {loadingAccept.loading && loadingAccept.id === announcement.id 
                          ? "En cours..." 
                          : announcement.isPriority ? "Urgent" : "Accepter"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state if no announcements */}
            {announcements.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Package className="h-12 w-12 mx-auto" />
                </div>
                <h2 className="text-xl font-medium mb-2">{t("deliveryman.noAnnouncementsAvailable")}</h2>
                <p className="text-gray-500 mb-4">{t("deliveryman.checkBackLater")}</p>
              </div>
            )}
          </>
        )}
      </main>
    </DeliverymanLayout>
  )
}