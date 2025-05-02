"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus } from "lucide-react"
import ResponsiveHeader from "../responsive-header"
import { useLanguage } from "@/components/language-context"
import { useRouter } from "next/navigation"

export default function AnnouncementsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Pair of running shoes",
      image: "/running-shoes.jpg",
      deliveryAddress: "11 rue Erand, Paris 75012",
      price: "£20",
      deliveryDate: "15th May - 30th May",
      amount: 1,
      storageBox: "Storage box 1",
    },
    {
      id: 2,
      title: "Pair of running shoes",
      image: "/running-shoes.jpg",
      deliveryAddress: "45 rue Erand, Paris 75017",
      price: "£14",
      deliveryDate: "3rd June - 17th June",
      amount: 1,
      storageBox: "Storage box 1",
    },
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showShoppingForm, setShowShoppingForm] = useState(false)
  const [shopTitle, setShopTitle] = useState("")
  const [shopPrice, setShopPrice] = useState("")
  const [shopList, setShopList] = useState("")
  const [shopDeliveryAddress, setShopDeliveryAddress] = useState("")
  const [shopDeliveryDate, setShopDeliveryDate] = useState("")

  // Ref pour détecter le clic en dehors du modal
  const modalRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowCreateModal(false)
        setShowShoppingForm(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const openCreateModal = () => {
    // reset form / mode chaque ouverture
    setShowShoppingForm(false)
    setShopTitle("")
    setShopPrice("")
    setShopList("")
    setShopDeliveryAddress("")
    setShopDeliveryDate("")
    setShowCreateModal(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm(t("announcements.confirmDelete"))) {
      setAnnouncements(announcements.filter((announcement) => announcement.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Utiliser le composant ResponsiveHeader avec la page active */}
      <ResponsiveHeader activePage="announcements" />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-2xl font-semibold text-center text-green-400">{t("announcements.yourAnnouncements")}</h1>

          <button
            onClick={openCreateModal}
            className="bg-green-400 text-white px-4 py-2 rounded-full flex items-center hover:bg-green-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("announcements.makeNewAnnouncement")}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 relative bg-green-200">
                <Image
                  src="/announcements.jpg"
                  alt={announcement.title}
                  width={200}
                  height={150}
                  className="object-contain mx-auto h-full"
                />
              </div>

              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{announcement.title}</h2>

                <div className="space-y-1 text-sm mb-4">
                  <p>
                    <span className="font-medium">{t("announcements.deliveryAddress")}:</span>{" "}
                    {announcement.deliveryAddress}
                  </p>
                  <p>
                    <span className="font-medium">{t("announcements.priceForDelivery")}:</span> {announcement.price}
                  </p>
                  <p>
                    <span className="font-medium">{t("announcements.deliveryDate")}:</span> {announcement.deliveryDate}
                  </p>
                  <p>
                    <span className="font-medium">{t("announcements.amount")}:</span> {announcement.amount}
                  </p>
                  <p>
                    <span className="font-medium">{t("announcements.storageBox")}:</span> {announcement.storageBox}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm hover:bg-red-200 transition-colors"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    {t("announcements.delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">{t("announcements.noAnnouncements")}</p>
            <button
              onClick={openCreateModal}
              className="bg-green-400 text-white px-4 py-2 rounded-full flex items-center mx-auto hover:bg-green-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t("announcements.makeFirstAnnouncement")}
            </button>
          </div>
        )}
      </main>

      {/* Modal de choix */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md">
            {!showShoppingForm ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t("announcements.createType")}</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    router.push("/app_client/announcements/create")
                  }}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded"
                >
                  {t("announcements.createPackage")}
                </button>
                <button
                  onClick={() => setShowShoppingForm(true)}
                  className="w-full px-4 py-2 bg-green-700 text-white rounded"
                >
                  {t("announcements.createShoppingList")}
                </button>
                <button onClick={() => setShowCreateModal(false)} className="mt-2 w-full px-4 py-2 border rounded">
                  {t("common.cancel")}
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  // ajouter la nouvelle annonce
                  setAnnouncements([
                    ...announcements,
                    {
                      id: Date.now(),
                      title: shopTitle,
                      image: "",
                      deliveryAddress: shopDeliveryAddress,
                      price: `£${shopPrice}`,
                      deliveryDate: shopDeliveryDate,
                      amount: 0,
                      storageBox: "",
                      shoppingList: shopList,
                    },
                  ])
                  // reset et fermer modal
                  setShowShoppingForm(false)
                  setShowCreateModal(false)
                }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold">{t("announcements.shoppingList")}</h2>
                <input
                  value={shopTitle}
                  onChange={(e) => setShopTitle(e.target.value)}
                  placeholder={t("announcements.title")}
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  value={shopDeliveryAddress}
                  onChange={(e) => setShopDeliveryAddress(e.target.value)}
                  placeholder={t("announcements.deliveryAddress")}
                  className="w-full px-3 py-2 border rounded"
                />
                <div className="flex items-center justify-between">
                  {t("announcements.deliveryDate")}
                </div>  
                <input
                  type="date"
                  value={shopDeliveryDate}
                  onChange={(e) => setShopDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  value={shopPrice}
                  onChange={(e) => setShopPrice(e.target.value)}
                  placeholder={t("announcements.listPrice")}
                  className="w-full px-3 py-2 border rounded"
                />
                <textarea
                  value={shopList}
                  onChange={(e) => setShopList(e.target.value)}
                  placeholder={t("announcements.shoppingListItems")}
                  className="w-full px-3 py-2 border rounded h-24"
                />
                <button type="submit" className="w-full px-4 py-2 bg-green-50 text-white rounded">
                  {t("common.create")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

