import { type NextRequest, NextResponse } from "next/server"

type Locale = "en" | "fr" | "es"

// Cette fonction simule la récupération des traductions depuis une base de données
// Dans une implémentation réelle, vous feriez un appel à votre base de données ici
async function getTranslationsFromDatabase(locale: string) {
  // Simulation - à remplacer par votre logique d'accès à la base de données
  const translations: Record<Locale, any> = {
    en: require("@/locales/en.json"),
    fr: require("@/locales/fr.json"),
    es: require("@/locales/es.json"),
  }

  const safeLocale = (["en", "fr", "es"].includes(locale) ? locale : "en") as Locale

  return translations[safeLocale]
}

export async function GET(request: NextRequest, { params }: { params: { locale: string } }) {
  try {
    const locale = params.locale.toLowerCase()
    const translations = await getTranslationsFromDatabase(locale)

    return NextResponse.json(translations)
  } catch (error) {
    console.error("Error fetching translations:", error)
    return NextResponse.json({ error: "Failed to fetch translations" }, { status: 500 })
  }
}