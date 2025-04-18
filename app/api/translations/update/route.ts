import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Dans une implémentation réelle, vous sauvegarderiez dans une base de données
// Cette implémentation sauvegarde dans les fichiers JSON pour la démonstration
export async function POST(request: NextRequest) {
  try {
    const { locale, translations } = await request.json()

    if (!locale || !translations) {
      return NextResponse.json({ error: "Locale and translations are required" }, { status: 400 })
    }

    // Vérifier que la locale est valide
    if (!["en", "fr", "es"].includes(locale.toLowerCase())) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 })
    }

    // Dans une implémentation réelle, vous sauvegarderiez dans une base de données
    // Pour la démonstration, nous sauvegardons dans les fichiers JSON
    const filePath = path.join(process.cwd(), "locales", `${locale.toLowerCase()}.json`)

    // Écrire les traductions dans le fichier
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), "utf8")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating translations:", error)
    return NextResponse.json({ error: "Failed to update translations" }, { status: 500 })
  }
}
