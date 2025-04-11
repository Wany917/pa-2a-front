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
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/app_deliveryman/dashboard" className="flex items-center">
              <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/app_deliveryman/dashboard"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  <span>{t("deliveryman.dashboard")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_deliveryman/announcements"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <PartyPopper className="mr-3 h-5 w-5" />
                  <span>{t("deliveryman.announcements")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_deliveryman/deliveries"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <Package className="mr-3 h-5 w-5" />
                  <span>{t("deliveryman.deliveries")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_deliveryman/notifications"
                  className="flex items-center rounded-md bg-green-50 px-4 py-3 text-white"
                >
                  <BellRing className="mr-3 h-5 w-5" />
                  <span>{t("deliveryman.notifications")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_deliveryman/messages"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <MessageSquare className="mr-3 h-5 w-5" />
                  <span>{t("deliveryman.messages")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_deliveryman/payments"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <CreditCard className="mr-3 h-5 w-5" />
                  <span>{t("deliveryman.payments")}</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Right actions */}
          <div className="ml-auto flex items-center space-x-4">
            <LanguageSelector />

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors"
              >
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Charlotte</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100">
                  <Link
                    href="/app_deliveryman/edit-account"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span>{t("common.editAccount")}</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <User className="h-4 w-4 mr-2" />
                    <span>{t("deliveryman.switchToClientAccount")}</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <div className="px-4 py-1 text-xs text-gray-500">{t("common.registerAs")}</div>

                  <Link href="/register/shopkeeper" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.shopkeeper")}
                  </Link>

                  <Link href="/register/service-provider" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.serviceProvider")}
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <Link href="/logout" className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>{t("common.logout")}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

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
                          className="px-6 py-2 bg-green-200 hover:bg-green-300 rounded-md transition-colors"
                        >
                          {t("deliveryman.accept")}
                        </button>
                        <button
                          onClick={() => handleReject(notification.id)}
                          className="px-6 py-2 bg-red-400 hover:bg-red-500 text-white rounded-md transition-colors"
                        >
                          {t("deliveryman.reject")}
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