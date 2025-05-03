"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"

export default function ShopkeeperEditJustificative() {
  const { t } = useLanguage()

  // Données fictives pour SIRET et SIREN
  const [siret, setSiret] = useState("123 456 789 00012") // Exemple de numéro SIRET fictif
  const [siren, setSiren] = useState("123 456 789") // Exemple de numéro SIREN fictif

  const handleSiretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSiret(e.target.value)
  }

  const handleSirenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSiren(e.target.value)
  }

  const handleSubmit = () => {
    // Simuler une soumission ou appeler une API pour sauvegarder les données
    alert(`SIRET: ${siret}, SIREN: ${siren}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 flex justify-between items-center shadow-sm">
        <Link href="/app_shopkeeper/dashboard" className="flex items-center">
          <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
        </Link>

        <div className="flex items-center mr-20">
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/app_shopkeeper/edit_account" className="text-green-500 hover:underline flex items-center">
            <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
            {t("common.back")}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 my-8">
          <h1 className="text-2xl font-semibold text-center mb-12">
            {t("shopkeeper.editYourJustificativePieces")}
          </h1>

          {/* SIRET Section */}
          <div className="mb-6">
            <label htmlFor="siret" className="block text-sm font-medium text-gray-700 mb-2">
              {t("shopkeeper.siretNumber")}
            </label>
            <input
              id="siret"
              type="text"
              value={siret}
              onChange={handleSiretChange}
              placeholder={t("shopkeeper.enterSiret")}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* SIREN Section */}
          <div className="mb-6">
            <label htmlFor="siren" className="block text-sm font-medium text-gray-700 mb-2">
              {t("shopkeeper.sirenNumber")}
            </label>
            <input
              id="siren"
              type="text"
              value={siren}
              onChange={handleSirenChange}
              placeholder={t("shopkeeper.enterSiren")}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-8 py-2 bg-green-50 text-white rounded-md hover:bg-green-400 transition-colors"
            >
              {t("deliveryman.editJustificative.confirm")}
            </button>
            <Link
              href="/app_shopkeeper/edit_account"
              className="px-8 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              {t("deliveryman.editJustificative.quit")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}