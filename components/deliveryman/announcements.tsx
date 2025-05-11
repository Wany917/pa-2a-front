"use client"

import { useState } from "react"
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

// Type pour les annonces
interface Announcement {
  id: string
  title: string
  image: string
  client: string
  address: string
  price: string
  deliveryDate: string
  amount: number
  storageBox: string
  size: "Small" | "Medium" | "Large"
  isPriority?: boolean
}

export default function DeliverymanAnnouncements() {
  const { t } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Modal d'acceptation
  const [showModal, setShowModal] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [isPartial, setIsPartial] = useState(false)
  const [partialLocation, setPartialLocation] = useState("")

  // Données d'exemple pour les annonces
  const announcements: Announcement[] = [
    {
      id: "a1",
      title: "Pair of running shoes",
      image: "/running-shoes.jpg",
      client: "Charlotte A.",
      address: "11 rue Erard, Paris 75012",
      price: "£20",
      deliveryDate: "15th May - 30th May",
      amount: 1,
      storageBox: "242 rue Faubourg Saint Antoine, Paris 75012",
      size: "Small",
      isPriority: true,
    },
    {
      id: "a2",
      title: "Pair of running shoes",
      image: "/running-shoes.jpg",
      client: "Stevin B.",
      address: "11 rue Erard, Paris 75012",
      price: "£20",
      deliveryDate: "15th May - 30th May",
      amount: 1,
      storageBox: "242 rue Faubourg Saint Antoine, Paris 75012",
      size: "Medium",
      isPriority: false,
    },
    {
      id: "a3",
      title: "Pair of running shoes",
      image: "/running-shoes.jpg",
      client: "Kevin C.",
      address: "11 rue Erard, Paris 75012",
      price: "£20",
      deliveryDate: "15th May - 30th May",
      amount: 1,
      storageBox: "242 rue Faubourg Saint Antoine, Paris 75012",
      size: "Large",
      isPriority: true,
    },
  ]

  const handleAcceptDelivery = (id: string) => {
    setCurrentId(id)
    setIsPartial(false)
    setPartialLocation("")
    setShowModal(true)
  }

  const confirmDelivery = () => {
    // Ici, appel API ou logique métier
    console.log(`Delivery ${currentId} accepted as ${isPartial ? `partielle jusqu'à ${partialLocation}` : "totale"}`)
    setShowModal(false)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/app_deliveryman" className="flex items-center">
              <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/app_deliveryman"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  <span>{t("deliveryman.dashboard")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_deliveryman/announcements"
                  className="flex items-center rounded-md bg-green-50 px-4 py-3 text-white"
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
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
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
      <div className="flex-1 overflow-x-hidden">
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

                  <Link href="/app_client" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <User className="h-4 w-4 mr-2" />
                    <span>{t("common.clientSpace")}</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <div className="px-4 py-1 text-xs text-gray-500">{t("common.accessToSpace")}</div>

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
        <main className="p-4 lg:p-6">
          <h1 className="mb-6 text-2xl font-bold">{t("deliveryman.announcements")}</h1>

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
                      onClick={() => handleAcceptDelivery(announcement.id)}
                      className={`${
                        announcement.isPriority ? "bg-red-500 hover:bg-red-600" : "bg-green-300 hover:bg-green-400"
                      } text-white px-4 py-2 rounded-md transition-colors`}
                    >
                      {t("deliveryman.acceptThisDelivery")}
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
        </main>

        {/* Modal après acceptation */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">{t("deliveryman.chooseDeliveryType")}</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isPartial}
                    onChange={() => setIsPartial(false)}
                    className="mr-2"
                  />
                  {t("deliveryman.fullDelivery")}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isPartial}
                    onChange={() => setIsPartial(true)}
                    className="mr-2"
                  />
                  {t("deliveryman.partialDelivery")}
                </label>
                {isPartial && (
                  <input
                    type="text"
                    placeholder={t("deliveryman.partialUntil")}
                    value={partialLocation}
                    onChange={e => setPartialLocation(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={confirmDelivery}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  disabled={isPartial && !partialLocation.trim()}
                >
                  {t("common.confirm")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}