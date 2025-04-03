"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ResponsiveHeader from "../../responsive-header"
import { useLanguage } from "@/components/language-context"

export default function CreateAnnouncementPage() {
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simuler une soumission
    setTimeout(() => {
      setIsSubmitting(false)
      window.location.href = "/dashboard/announcements"
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Utiliser le composant ResponsiveHeader */}
      <ResponsiveHeader activePage="announcements" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/dashboard/announcements" className="text-gray-600 hover:text-green-500 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-green-400">{t("announcements.createNewAnnouncement")}</h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("announcements.announceName")}
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="whereTo" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("announcements.whereTo")}
                </label>
                <input
                  type="text"
                  id="whereTo"
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
                  href="/dashboard/announcements"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t("common.cancel")}
                </Link>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("common.adding") : t("announcements.addNow")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

