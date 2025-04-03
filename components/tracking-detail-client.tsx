"use client"

import { useLanguage } from "@/components/language-context"

const TrackingDetailClient = () => {
  const { t } = useLanguage()

  return (
    <div>
      <h1>{t("trackingDetail.title")}</h1>
      <p>{t("trackingDetail.description")}</p>
      <button>{t("trackingDetail.button")}</button>
    </div>
  )
}

export default TrackingDetailClient

