"use client"

import type React from "react"
import { useLanguage } from "@/components/language-context"

type TrackingClientProps = {}

const TrackingClient: React.FC<TrackingClientProps> = () => {
  const { t } = useLanguage()

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">{t("tracking.trackYourPackage")}</h1>
      <p>{t("tracking.enterTrackingNumber")}</p>
      {/* Add input field and button here */}
      <button>{t("tracking.track")}</button>
    </div>
  )
}

export default TrackingClient

