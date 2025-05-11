"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Package } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import DeliverymanLayout from "@/components/deliveryman/layout"

// Type pour les livraisons
interface Delivery {
  id: string
  image: string
  announceName: string
  whereTo: string
  price: string
  amount: number
  deliveryDate: string
  status: "paid" | "in_transit" | "delivered" | "pending"
  isPriority?: boolean
}

export default function DeliverymanDeliveriesPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")

  // Données d'exemple pour les livraisons
  const deliveries: Delivery[] = [
    {
      id: "d1",
      image: "/running-shoes.jpg",
      announceName: "Pair of running shoes",
      whereTo: "11 rue Erard, Paris 75012",
      price: "£20.00",
      amount: 1,
      deliveryDate: "26th May",
      status: "paid",
      isPriority: false,
    },
    {
      id: "d2",
      image: "/running-shoes.jpg",
      announceName: "Pair of running shoes",
      whereTo: "45 rue Erand, Paris 75017",
      price: "£14.00",
      amount: 1,
      deliveryDate: "3rd June",
      status: "in_transit",
      isPriority: true,
    },
    {
      id: "d3",
      image: "/running-shoes.jpg",
      announceName: "Pair of running shoes",
      whereTo: "78 avenue Victor Hugo, Paris 75016",
      price: "£18.50",
      amount: 1,
      deliveryDate: "10th June",
      status: "pending",
      isPriority: false,
    },
  ]

  // Filtrer les livraisons en fonction de la recherche
  const filteredDeliveries = deliveries.filter((delivery) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      delivery.announceName.toLowerCase().includes(query) ||
      delivery.whereTo.toLowerCase().includes(query) ||
      delivery.price.toLowerCase().includes(query) ||
      delivery.deliveryDate.toLowerCase().includes(query)
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{t("deliveryman.deliveries")}</h1>
        
        {/* Search bar */}
        <div className="mt-4 sm:mt-0 relative">
          <div className="relative">
            <input
              type="text"
              placeholder={t("deliveryman.searchDeliveries")}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Deliveries grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeliveries.map((delivery) => (
          <div key={delivery.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <Image
                src={delivery.image}
                alt={delivery.announceName}
                fill
                className="object-cover"
              />
              {delivery.isPriority && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {t("deliveryman.priority")}
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{delivery.announceName}</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 text-sm">{t("deliveryman.deliveryTo")}:</span>
                <span className="text-gray-800 font-medium text-sm">{delivery.whereTo}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 text-sm">{t("deliveryman.price")}:</span>
                <span className="text-gray-800 font-medium">{delivery.price}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 text-sm">{t("deliveryman.amount")}:</span>
                <span className="text-gray-800 font-medium">{delivery.amount}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 text-sm">{t("deliveryman.deliveryDate")}:</span>
                <span className="text-gray-800 font-medium">{delivery.deliveryDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(delivery.status)}`}
                >
                  {getStatusText(delivery.status)}
                </span>
                <Link
                  href={`/app_deliveryman/delivery/${delivery.id}`}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  {t("deliveryman.viewDetails")}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t("deliveryman.noDeliveries")}</h3>
          <p className="mt-1 text-sm text-gray-500">{t("deliveryman.noDeliveriesDescription")}</p>
        </div>
      )}
    </DeliverymanLayout>
  )
}
