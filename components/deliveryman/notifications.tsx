"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
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

// Mock data for notifications
const mockNotifications = [
  {
    id: "1",
    productName: "Pair of running shoes",
    image: "/running-shoes.jpg",
    sender: "Stevin B.",
    deliveryAddress: "11 rue Erard, Paris 75012",
    price: "£20",
    deliveryDate: "15th May - 30th May",
    amount: 1,
    storageBox: "242 rue Faubourg Saint Antoine, Paris 75012",
    size: "Medium",
  },
  {
    id: "2",
    productName: "Pair of running shoes",
    image: "/running-shoes.jpg",
    sender: "Kevin C.",
    deliveryAddress: "11 rue Erard, Paris 75012",
    price: "£20",
    deliveryDate: "15th May - 30th May",
    amount: 1,
    storageBox: "242 rue Faubourg Saint Antoine, Paris 75012",
    size: "Large",
  },
]

export default function NotificationsClient() {
  const { t } = useLanguage()
  const router = useRouter()
  const [notifications, setNotifications] = useState(mockNotifications)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleAccept = (id: string) => {
    // Here you would typically call an API to accept the delivery
    console.log(`Accepted delivery ${id}`)
    // Remove the notification from the list
    setNotifications(notifications.filter((notification) => notification.id !== id))
    // Redirect to deliveries page or show a success message
  }

  const handleReject = (id: string) => {
    // Here you would typically call an API to reject the delivery
    console.log(`Rejected delivery ${id}`)
    // Remove the notification from the list
    setNotifications(notifications.filter((notification) => notification.id !== id))
    // Show a success message
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1 flex flex-col">

        {/* Page content */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">{t("deliveryman.notifications")}</h1>

          {notifications.length > 0 ? (
            <>
              <p className="text-center text-lg mb-8">{t("deliveryman.notificationsDescription")}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notifications.map((notification) => (
                  <div key={notification.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-center mb-4">
                        <Image
                          src={notification.image || "/placeholder.svg"}
                          alt={notification.productName}
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
                          onClick={() => handleAccept(notification.id)}
                          className="px-6 py-2 text-white bg-green-50 hover:bg-green-300 rounded-md transition-colors"
                        >
                          {t("common.accept")}
                        </button>
                        <button
                          onClick={() => handleReject(notification.id)}
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
              <h3 className="text-xl font-medium text-gray-600 mb-2">{t("deliveryman.noNotifications")}</h3>
              <p className="text-gray-500">{t("deliveryman.checkBackLater")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}