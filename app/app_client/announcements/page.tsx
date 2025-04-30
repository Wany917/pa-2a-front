"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus } from "lucide-react"
import ResponsiveHeader from "../responsive-header"
import { useLanguage } from "@/components/language-context"

export default function AnnouncementsPage() {
  const { t } = useLanguage()
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

          <Link
            href="/app_client/announcements/create"
            className="bg-green-400 text-white px-4 py-2 rounded-full flex items-center hover:bg-green-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("announcements.makeNewAnnouncement")}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 relative bg-green-200">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capture%20d%E2%80%99e%CC%81cran%202025-03-31%20a%CC%80%2020.01.59-jjYWcMxzH05nScY2mIZQMz1nXvfZ41.png"
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
                  <Link
                    href={`/app_client/announcements/edit/${announcement.id}`}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors inline-block"
                  >
                    {t("announcements.edit")}
                  </Link>
                  <button
                    className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm hover:bg-red-200 transition-colors"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    {t("announcements.delete")}
                  </button>
                  <button className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-md text-sm hover:bg-yellow-200 transition-colors">
                    {t("announcements.editNoDeliveryDate")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">{t("announcements.noAnnouncements")}</p>
            <Link
              href="/app_client/announcements/create"
              className="bg-green-400 text-white px-4 py-2 rounded-full flex items-center mx-auto hover:bg-green-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t("announcements.makeFirstAnnouncement")}
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

