"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Types pour nos traductions
type Language = "FR" | "EN" | "ES"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isLoading: boolean
}

// Créer le contexte avec des valeurs par défaut
const defaultContextValue: LanguageContextType = {
  language: "EN",
  setLanguage: () => {},
  t: (key) => key,
  isLoading: true,
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

// Export the useTranslation hook
export function useTranslation() {
  return useLanguage()
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
  const [translations, setTranslations] = useState<Record<string, any>>({})
  // État pour suivre si le composant est monté
  const [isMounted, setIsMounted] = useState(false)
  // État pour suivre si les traductions sont en cours de chargement
  const [isLoading, setIsLoading] = useState(true)

  // Fonction pour charger les traductions depuis l'API
  const fetchTranslations = async (locale: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/translations/${locale.toLowerCase()}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch translations: ${response.status}`)
      }
      const data = await response.json()
      setTranslations(data)
    } catch (error) {
      console.error("Error loading translations:", error)
      // Fallback to empty translations
      setTranslations({})
    } finally {
      setIsLoading(false)
    }
  }

  // Effet pour initialiser la langue après le montage du composant
  useEffect(() => {
    setIsMounted(true)
    const initialLang = getInitialLanguage()
    setLanguageState(initialLang)

    // Charger les traductions depuis l'API
    fetchTranslations(initialLang)
  }, [])

  // Fonction pour changer la langue
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)

    // Sauvegarder dans localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, lang)
    }

    // Charger les traductions depuis l'API
    fetchTranslations(lang)
  }

  // Fonction pour obtenir une traduction par clé
  const t = (key: string) => {
    // Si les traductions sont en cours de chargement, retourner la clé
    if (isLoading) return key

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

    return typeof value === "string" ? value : key
  }

  // Ne pas rendre le contexte tant que le composant n'est pas monté
  // pour éviter les problèmes d'hydratation
  if (!isMounted) {
    return <>{children}</>
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>{children}</LanguageContext.Provider>
}