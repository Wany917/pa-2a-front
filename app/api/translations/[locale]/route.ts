import { type NextRequest, NextResponse } from "next/server"

type Locale = "en" | "fr" | "es"

async function getTranslationsFromDatabase(locale: string) {
  const translations: Record<Locale, any> = {
    en: require("@/locales/en.json"),
    fr: require("@/locales/fr.json"),
    es: require("@/locales/es.json"),
  }
  const safeLocale = (["en", "fr", "es"].includes(locale) ? locale : "en") as Locale
  return translations[safeLocale]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params
    const translations = await getTranslationsFromDatabase(locale)
    return NextResponse.json(translations)
  } catch (error) {
    console.error("Error fetching translations:", error)
    return NextResponse.json(
      { error: "Failed to fetch translations" },
      { status: 500 }
    )
  }
}