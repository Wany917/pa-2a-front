"use client"

import { useLanguage } from "./language-context"

export default function TranslationExample() {
  const { language, t } = useLanguage()

  return (
    <div className="p-4 bg-gray-100 rounded-md">
      <h2 className="text-lg font-bold mb-2">
        {t("common.currentLanguage")}: {language}
      </h2>
      <p>{t("app_client.welcome")}</p>
      <p>{t("auth.pleaseEnterEmailPassword")}</p>
      <button className="mt-2 px-4 py-2 bg-green-50 text-white rounded-md">{t("common.login")}</button>
    </div>
  )
}

