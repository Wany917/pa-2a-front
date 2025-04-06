"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ResponsiveHeader from "../../../responsive-header"
import { useLanguage } from "@/components/language-context"

export default function EditAnnouncementPage() {
  const { t } = useLanguage()
  const params = useParams()
  const { id } = params
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [announcement, setAnnouncement] = useState({
    title: "Pair of running shoes",
    deliveryAddress: "11 rue Erand, Paris 75012",
    price: "20",
    deliveryDate: "2025-05-15",
    amount: "1",
    storageBox: "Storage box 1",
    packageSize: "Medium",
    weight: "2.5",
    priorityShipping: false,
  })

  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Simuler le chargement des données
  useEffect(() => {
    // Dans une application réelle, vous feriez un appel API ici
    console.log(`Loading announcement with ID: ${id}`)
  }, [id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Dans une application réelle, vous créeriez un FormData pour envoyer l'image
    const formData = new FormData()
    formData.append("title", announcement.title)
    formData.append("deliveryAddress", announcement.deliveryAddress)
    formData.append("price", announcement.price)
    formData.append("deliveryDate", announcement.deliveryDate)
    formData.append("amount", announcement.amount)
    formData.append("storageBox", announcement.storageBox)
    formData.append("packageSize", announcement.packageSize)
    formData.append("weight", announcement.weight)
    formData.append("priorityShipping", announcement.priorityShipping.toString())

    if (image) {
      formData.append("image", image)
    }

    // Simuler une soumission
    setTimeout(() => {
      setIsSubmitting(false)
      window.location.href = "/app_client/announcements"
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setAnnouncement((prev) => ({ ...prev, [id]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target
    setAnnouncement((prev) => ({ ...prev, [id]: checked }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Utiliser le composant ResponsiveHeader */}
      <ResponsiveHeader activePage="announcements" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/app_client/announcements" className="text-gray-600 hover:text-green-500 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-green-400">{t("announcements.editYourAnnouncement")}</h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center mb-8">
                <div className="w-64 h-64 mb-2 relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt={announcement.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                      <span className="text-gray-400">{t("announcements.noImage")}</span>
                    </div>
                  )}
                </div>
                <label htmlFor="photo-upload" className="text-green-500 hover:text-green-600 cursor-pointer text-sm">
                  {t("announcements.editPhoto")}
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("announcements.announceName")}
                </label>
                <input
                  type="text"
                  id="title"
                  value={announcement.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("announcements.whereTo")}
                </label>
                <input
                  type="text"
                  id="deliveryAddress"
                  value={announcement.deliveryAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("announcements.price")}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                    <input
                      type="number"
                      id="price"
                      value={announcement.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("announcements.deliveryDate")}
                  </label>
                  <input
                    type="date"
                    id="deliveryDate"
                    value={announcement.deliveryDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("announcements.amount")}
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={announcement.amount}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="storageBox" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("announcements.storageBox")}
                  </label>
                  <select
                    id="storageBox"
                    value={announcement.storageBox}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">{t("common.selectYourStorageBox")}</option>
                    <option value="Storage box 1">Storage box 1</option>
                    <option value="Storage box 2">Storage box 2</option>
                    <option value="Storage box 3">Storage box 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="packageSize" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("announcements.packageSize")}
                </label>
                <select
                  id="packageSize"
                  value={announcement.packageSize}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">{t("common.selectYourPackageSize")}</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("announcements.weight")}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="weight"
                    value={announcement.weight}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">kg</span>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="priorityShipping"
                  checked={announcement.priorityShipping}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="priorityShipping" className="ml-2 block text-sm text-gray-700">
                  {t("announcements.activatePriorityShipping")}
                </label>
              </div>

              <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800">
                {t("announcements.priorityShippingInfo")}
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  href="/app_client/announcements"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t("common.cancel")}
                </Link>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("common.saving") : t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

