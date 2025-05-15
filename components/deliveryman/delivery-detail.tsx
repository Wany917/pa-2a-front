"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
import { Package, ChevronDown } from "lucide-react"

interface DeliveryData {
  id: string | number
  name?: string
  image?: string
  sender?: string
  deliveryAddress?: string
  price?: string
  deliveryDate?: string
  amount?: number
  storageBox?: string
  size?: string
  status?: string
  timeAway?: string
  // Champs de l'API
  annonceId?: number
  livreurId?: number
  statut?: string
  dateLivraison?: string
  estPartielle?: boolean
  pointArretPartiel?: string
  colis?: any
  annonce?: any
}

const DeliveryDetailClient = ({ id }: { id: string }) => {
  const { t } = useLanguage()
  const [delivery, setDelivery] = useState<DeliveryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState<string[]>(Array(6).fill("")) // État pour les 6 chiffres
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Récupération des données de livraison depuis l'API
    const fetchDelivery = async () => {
      setLoading(true)
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
        if (!token) {
          setError("Vous devez être connecté")
          setLoading(false)
          return
        }

        // Récupérer les détails de la livraison
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/livraisons/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération de la livraison')
        }

        const livraisonData = await response.json()
        
        // Récupérer les informations de l'annonce associée
        let annonceData: any = {}
        if (livraisonData.annonceId) {
          const annonceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/annonces/${livraisonData.annonceId}`, {
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
        }

        // Fusionner les données
        const deliveryData: DeliveryData = {
          id: livraisonData.id,
          annonceId: livraisonData.annonceId,
          livreurId: livraisonData.livreurId,
          statut: livraisonData.statut,
          dateLivraison: livraisonData.dateLivraison,
          estPartielle: livraisonData.estPartielle,
          pointArretPartiel: livraisonData.pointArretPartiel,
          colis: livraisonData.colis,
          annonce: annonceData,
          // Champs formatés pour l'affichage
          name: annonceData.titre || "Livraison sans titre",
          image: annonceData.image || "/placeholder.svg",
          sender: annonceData.utilisateur?.prenom || "Client",
          deliveryAddress: annonceData.adresseLivraison || livraisonData.adresseLivraison || "Adresse non spécifiée",
          price: annonceData.prix ? `€${annonceData.prix}` : "Prix non spécifié",
          deliveryDate: formatDateRange(annonceData.dateRetraitDebut, annonceData.dateRetraitFin),
          amount: annonceData.quantite || 1,
          storageBox: annonceData.entrepot?.adresse || "Non spécifié",
          size: getSizeFromWeight(annonceData.poids || 0),
          status: getStatusText(livraisonData.statut || "en_attente"),
          timeAway: "1 heure de trajet"
        }

        setDelivery(deliveryData)
      } catch (error) {
        console.error("Error fetching delivery:", error)
        setError("Impossible de charger les détails de la livraison")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchDelivery()
    }
  }, [id])

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

  // Fonction pour obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case "en_attente":
        return "En attente"
      case "en_cours":
        return "En cours de livraison"
      case "livré":
        return "Livré"
      case "payé":
        return "Payé"
      default:
        return status
    }
  }

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    if (/^\d{1,6}$/.test(pastedData)) {
      const newCode = [...code]
      for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
        newCode[i] = pastedData[i]
      }
      setCode(newCode)

      const focusIndex = Math.min(pastedData.length, 5)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const verificationCode = code.join("")
    
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
      if (!token || !delivery) {
        setIsSubmitting(false)
        return
      }
      
      // Ici on pourrait avoir un appel API pour vérifier le code
      // Pour le moment on simule avec un code fixe
      if (verificationCode === "123456") {
        // Mettre à jour le statut de la livraison
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/livraisons/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            statut: "livré"
          }),
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour de la livraison")
        }
        
        // Mettre à jour l'interface
        setDelivery({
          ...delivery,
          statut: "livré",
          status: "Livré"
        })
        
        alert(t("deliveryman.codeValidated"))
      } else {
        alert(t("deliveryman.invalidCode"))
      }
    } catch (error) {
      console.error("Erreur lors de la validation du code:", error)
      alert("Une erreur est survenue lors de la validation du code")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
        <Link href="/app_deliveryman/deliveries" className="text-green-500 hover:text-green-600 transition-colors">
          {t("deliveryman.deliveries.backToDeliveries")}
        </Link>
      </div>
    )
  }

  if (!delivery) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">{t("deliveryman.deliveries.deliveryNotFound")}</h2>
        <Link href="/app_deliveryman/deliveries" className="text-green-500 hover:text-green-600 transition-colors">
          {t("deliveryman.deliveries.backToDeliveries")}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 flex justify-between items-center shadow-sm">
        <Link href="/app_deliveryman" className="flex items-center">
          <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
        </Link>

        <div className="flex items-center mr-20">
          <LanguageSelector />
        </div>
      </header>

      <div className="p-6">
        <div className="mb-6">
          <Link href="/app_deliveryman/deliveries" className="text-green-500 hover:underline flex items-center">
            <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
            {t("deliveryman.backToDeliveries")}
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">{t("deliveryman.deliveryDetails")}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Delivery information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-center mb-6">
              <div className="relative w-full max-w-md h-64">
                <Image src={delivery.image || "/placeholder.svg"} alt={delivery.name || ""} fill className="object-contain rounded-md" />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4">{delivery.name}</h2>

            <div className="space-y-3">
              <p>
                <span className="font-medium">{t("deliveryman.deliveryFor")}</span> {delivery.sender}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.deliveryAddress")}</span>:{" "}
                {delivery.deliveryAddress}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.priceForDelivery")}</span>: {delivery.price}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.deliveryDate")}</span>: {delivery.deliveryDate}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.amount")}</span>: {delivery.amount}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.storageBox")}</span>: {delivery.storageBox}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.status")}</span>: {delivery.status}
              </p>

              <div className="flex items-center mt-4">
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                  <Package className="w-4 h-4 mr-1" />
                  {delivery.size}
                </span>
              </div>
            </div>
          </div>

          {/* Right column - Code validation (uniquement affiché si la livraison est en cours) */}
          {delivery.statut === "en_cours" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">{t("deliveryman.enterCode")}</h2>
              <p className="text-gray-600 mb-4">{t("deliveryman.enterCodeDescription")}</p>

              <div className="flex justify-center space-x-2 mb-6">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={code[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-xl font-bold rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || code.some((digit) => digit === "")}
                className={`w-full py-2 rounded-md text-white ${
                  isSubmitting || code.some((digit) => digit === "")
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isSubmitting ? t("deliveryman.validatingCode") : t("deliveryman.validateCode")}
              </button>
            </div>
          )}
          
          {/* Message si la livraison est déjà terminée */}
          {delivery.statut === "livré" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-green-600">{t("deliveryman.deliveryCompleted")}</h2>
              <p className="text-gray-600 mb-4">{t("deliveryman.deliveryCompletedDescription")}</p>
              
              <div className="bg-green-50 p-4 rounded-md text-green-700">
                <p className="font-medium">{t("deliveryman.thankYou")}</p>
              </div>
            </div>
          )}
          
          {/* Si la livraison est en attente, afficher un bouton pour commencer */}
          {delivery.statut === "en_attente" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">{t("deliveryman.startDelivery")}</h2>
              <p className="text-gray-600 mb-4">{t("deliveryman.startDeliveryDescription")}</p>
              
              <button
                type="button"
                onClick={async () => {
                  try {
                    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
                    if (!token) return
                    
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/livraisons/${id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        statut: "en_cours"
                      }),
                      credentials: 'include'
                    })
                    
                    if (!response.ok) {
                      throw new Error("Erreur lors du démarrage de la livraison")
                    }
                    
                    setDelivery({
                      ...delivery,
                      statut: "en_cours",
                      status: "En cours de livraison"
                    })
                    
                    alert(t("deliveryman.deliveryStarted"))
                  } catch (error) {
                    console.error("Erreur lors du démarrage de la livraison:", error)
                    alert("Une erreur est survenue lors du démarrage de la livraison")
                  }
                }}
                className="w-full py-2 rounded-md text-white bg-green-500 hover:bg-green-600"
              >
                {t("deliveryman.startDelivery")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeliveryDetailClient