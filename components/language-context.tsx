"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Types pour nos traductions
type Language = "FR" | "EN" | "ES"

// Importation directe des fichiers de traduction depuis leur nouvel emplacement
import frTranslations from "@/locales/fr.json"
import enTranslations from "@/locales/en.json"
import esTranslations from "@/locales/es.json"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

// Créer le contexte avec des valeurs par défaut
const defaultContextValue: LanguageContextType = {
  language: "EN",
  setLanguage: () => {},
  t: (key) => key,
}

// Créer le contexte
const LanguageContext = createContext<LanguageContextType>(defaultContextValue)

// Constante pour le nom de la clé dans localStorage
const STORAGE_KEY = "ecodeli-language"

// Hook personnalisé pour utiliser le contexte de langue
export function useLanguage() {
  const context = useContext(LanguageContext)
  return context
}

// Fonction pour obtenir la langue initiale
const getInitialLanguage = (): Language => {
  if (typeof window !== "undefined") {
    // Essayer de récupérer depuis localStorage
    const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language | null
    if (savedLanguage && ["FR", "EN", "ES"].includes(savedLanguage)) {
      return savedLanguage
    }

    // Si pas dans localStorage, essayer de détecter la langue du navigateur
    const browserLang = navigator.language.split("-")[0].toUpperCase()
    if (browserLang === "FR") return "FR"
    if (browserLang === "ES") return "ES"
  }

  // Par défaut, utiliser l'anglais
  return "EN"
}

// Fournisseur de contexte de langue
export function LanguageProvider({ children }: { children: ReactNode }) {
  // État pour stocker la langue actuelle, initialisé avec une fonction pour éviter les problèmes SSR
  const [language, setLanguageState] = useState<Language>("EN")
  // État pour stocker les traductions
  const [translations, setTranslations] = useState<Record<string, any>>(enTranslations)
  // État pour suivre si le composant est monté
  const [isMounted, setIsMounted] = useState(false)

  // Effet pour initialiser la langue après le montage du composant
  useEffect(() => {
    setIsMounted(true)
    const initialLang = getInitialLanguage()
    setLanguageState(initialLang)

    // Charger les traductions correspondantes
    switch (initialLang) {
      case "FR":
        setTranslations(frTranslations)
        break
      case "ES":
        setTranslations(esTranslations)
        break
      default:
        setTranslations(enTranslations)
    }
  }, [])

  // Fonction pour changer la langue
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)

    // Sauvegarder dans localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, lang)
    }

    // Charger les traductions correspondantes
    switch (lang) {
      case "FR":
        setTranslations(frTranslations)
        break
      case "ES":
        setTranslations(esTranslations)
        break
      default:
        setTranslations(enTranslations)
    }
  }

  // Fonction pour obtenir une traduction par clé
  const t = (key: string) => {
    // Diviser la clé par des points pour accéder aux objets imbriqués
    const keys = key.split(".")
    let value = translations

    // Parcourir l'objet de traductions pour trouver la valeur
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Retourner la clé si la traduction n'est pas trouvée
        return key
      }
    }

    return value as string
  }

  // Ne pas rendre le contexte tant que le composant n'est pas monté
  // pour éviter les problèmes d'hydratation
  if (!isMounted) {
    return <>{children}</>
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

