"use client"

import { useState } from "react"
import { useLanguage } from "@/components/language-context"
import DeliverymanLayout from "@/components/deliveryman/layout"
import { PartyPopper } from "lucide-react"

export default function DeliverymanAnnouncementsPage() {
  const { t } = useLanguage()
  
  return (
    <DeliverymanLayout>
      <h1 className="mb-6 text-2xl font-bold">{t("deliveryman.announcements")}</h1>
      
      {/* Placeholder content for announcements */}
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <PartyPopper className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t("deliveryman.noAnnouncements")}</h2>
        <p className="text-gray-600">{t("deliveryman.checkBackLater")}</p>
      </div>
    </DeliverymanLayout>
  )
}