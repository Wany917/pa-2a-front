"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"
import { Package, MapPin } from "lucide-react"

const DeliveryDetailClient = ({ id }: { id: string }) => {
  const { t } = useLanguage()
  const [delivery, setDelivery] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching delivery data
    const fetchDelivery = async () => {
      setLoading(true)
      try {
        // This is mock data - in a real app, you would fetch from an API
        const mockDelivery = {
          id,
          name: "Pair of running shoes",
          image: "/running-shoes.jpg",
          sender: "Charlotte A.",
          deliveryAddress: "11 rue Erard, Paris 75012",
          price: "£20",
          deliveryDate: "15th May - 30th May",
          amount: 1,
          storageBox: "242 rue Faubourg Saint Antoine, Paris 75012",
          size: "Small",
          status: "The package is in the mailbox",
          timeAway: "1 hour away",
          route: {
            // Map coordinates would go here
          },
        }

        setDelivery(mockDelivery)
      } catch (error) {
        console.error("Error fetching delivery:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDelivery()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!delivery) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">{t("deliveryman.deliveries.deliveryNotFound")}</h2>
        <Link href="/deliveryman/deliveries" className="text-green-500 hover:text-green-600 transition-colors">
          {t("deliveryman.deliveries.backToDeliveries")}
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t("deliveryman.deliveries.deliveryDetails")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Delivery information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center mb-6">
            <div className="relative w-full max-w-md h-64">
              <Image src="/running-shoes.jpg" alt={delivery.name} fill className="object-contain rounded-md" />
            </div>
          </div>

          <h2 className="text-xl font-bold mb-4">{delivery.name}</h2>

          <div className="space-y-3">
            <p>
              <span className="font-medium">{t("deliveryman.deliveries.by")}</span> {delivery.sender}
            </p>
            <p>
              <span className="font-medium">{t("deliveryman.deliveries.deliveryAddress")}</span>:{" "}
              {delivery.deliveryAddress}
            </p>
            <p>
              <span className="font-medium">{t("deliveryman.deliveries.priceForDelivery")}</span>: {delivery.price}
            </p>
            <p>
              <span className="font-medium">{t("deliveryman.deliveries.deliveryDate")}</span>: {delivery.deliveryDate}
            </p>
            <p>
              <span className="font-medium">{t("deliveryman.deliveries.amount")}</span>: {delivery.amount}
            </p>
            <p>
              <span className="font-medium">{t("deliveryman.deliveries.storageBox")}</span>: {delivery.storageBox}
            </p>

            <div className="flex items-center mt-4">
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                <Package className="w-4 h-4 mr-1" />
                {delivery.size}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/app_deliveryman/deliveries"
          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {t("deliveryman.deliveries.backToDeliveries")}
        </Link>
      </div>
    </div>
  )
}

export default DeliveryDetailClient