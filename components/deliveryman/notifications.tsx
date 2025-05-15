"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-context"
import DeliverymanLayout from "./layout"
import { Package } from "lucide-react"

// Type pour les notifications de livraison
interface Notification {
  id: string | number
  productName?: string
  image?: string
  sender?: string
  deliveryAddress?: string
  price?: string
  deliveryDate?: string
  amount?: number
  storageBox?: string
  size?: string
  annonceId?: number
}

export default function DeliverymanNotifications() {
  const { t } = useLanguage()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
        if (!token) {
          setError("Vous devez être connecté")
          setLoading(false)
          return
        }

        // Ici nous devrions avoir un endpoint spécial pour les notifications,
        // mais nous utiliserons les annonces disponibles comme exemple
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/annonces`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des notifications')
        }

        const data = await response.json()
        
        // Transformer les données pour notre interface
        const formattedNotifications = data.slice(0, 3).map((annonce: any) => ({
          id: annonce.id,
          annonceId: annonce.id,
          productName: annonce.titre || "Annonce sans titre",
          image: annonce.image || "/placeholder.svg",
          sender: annonce.utilisateur?.prenom || "Client",
          deliveryAddress: annonce.adresseLivraison || "Adresse non spécifiée",
          price: `€${annonce.prix || 0}`,
          deliveryDate: formatDateRange(annonce.dateRetraitDebut, annonce.dateRetraitFin),
          amount: annonce.quantite || 1,
          storageBox: annonce.entrepot?.adresse || "Non spécifié",
          size: getSizeFromWeight(annonce.poids || 0)
        }))

        setNotifications(formattedNotifications)
      } catch (error) {
        console.error("Erreur lors de la récupération des notifications:", error)
        setError("Impossible de charger les notifications")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  // Fonction utilitaire pour formater la plage de dates
  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "Date non spécifiée"
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
  }

  // Fonction pour déterminer la taille en fonction du poids
  const getSizeFromWeight = (weight: number) => {
    if (weight <= 1) return "Small"
    if (weight <= 5) return "Medium"
    return "Large"
  }

  const handleAccept = async (id: string) => {
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
      if (!token) return

      // Récupérer les informations de l'utilisateur connecté
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

      // Créer une nouvelle livraison
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/annonces/${id}/livraisons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          livreurId: livreurId,
          statut: 'en_attente'
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la livraison')
      }

      // Supprimer la notification
      setNotifications(notifications.filter(notif => notif.id !== id))
      
      // Rediriger vers les livraisons
      router.push('/app_deliveryman/deliveries')
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la livraison:", error)
      alert("Une erreur est survenue lors de l'acceptation de la livraison")
    }
  }

  const handleReject = (id: string) => {
    // Ici on simule simplement la suppression de la notification
    setNotifications(notifications.filter(notif => notif.id !== id))
  }

  return (
    <DeliverymanLayout>
      {/* Page content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">{t("deliveryman.notifications")}</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            {error}
          </div>
        ) : notifications.length > 0 ? (
          <>
            <p className="text-center text-lg mb-8">{t("deliveryman.notificationsDescription")}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notifications.map((notification) => (
                <div key={notification.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-center mb-4">
                      <Image
                        src={notification.image || "/placeholder.svg"}
                        alt={notification.productName || "Notification image"}
                        width={260}
                        height={160}
                        className="object-contain"
                      />
                    </div>

                    <h3 className="text-xl font-semibold mb-2">{notification.productName}</h3>

                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">{t("deliveryman.by")}</span> {notification.sender}
                      </p>
                      <p>
                        <span className="font-medium">{t("deliveryman.deliveryAddress")}</span> :{" "}
                        {notification.deliveryAddress}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.priceForDelivery")}</span> :{" "}
                        {notification.price}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.deliveryDate")}</span> :{" "}
                        {notification.deliveryDate}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.amount")}</span> : {notification.amount}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.storageBox")}</span> :{" "}
                        {notification.storageBox}
                      </p>
                    </div>

                    <div className="mt-4 text-center">
                      <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                        {notification.size}
                      </span>
                    </div>

                    <div className="mt-6 flex justify-center space-x-4">
                      <button
                        onClick={() => handleAccept(notification.id.toString())}
                        className="px-6 py-2 text-white bg-green-50 hover:bg-green-300 rounded-md transition-colors"
                      >
                        {t("common.accept")}
                      </button>
                      <button
                        onClick={() => handleReject(notification.id.toString())}
                        className="px-6 py-2 bg-red-400 hover:bg-red-500 text-white rounded-md transition-colors"
                      >
                        {t("common.reject")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">{t("deliveryman.noNotifications")}</h3>
            <p className="text-gray-500">{t("deliveryman.checkBackLater")}</p>
          </div>
        )}
      </div>
    </DeliverymanLayout>
  )
}