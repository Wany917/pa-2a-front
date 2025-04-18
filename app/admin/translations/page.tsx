"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TranslationsAdmin() {
  const [activeLocale, setActiveLocale] = useState("en")
  const [translations, setTranslations] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Charger les traductions pour la locale active
  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/translations/${activeLocale}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch translations: ${response.status}`)
        }
        const data = await response.json()
        setTranslations(data)
      } catch (error) {
        console.error("Error loading translations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranslations()
  }, [activeLocale])

  // Fonction pour mettre à jour une traduction
  const updateTranslation = (path: string[], value: string) => {
    setTranslations((prev) => {
      const newTranslations = { ...prev }
      let current = newTranslations

      // Naviguer jusqu'au parent de la clé à mettre à jour
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {}
        }
        current = current[path[i]]
      }

      // Mettre à jour la valeur
      current[path[path.length - 1]] = value

      return newTranslations
    })
  }

  // Fonction pour sauvegarder les traductions
  const saveTranslations = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/translations/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locale: activeLocale,
          translations,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save translations: ${response.status}`)
      }

      alert(`Translations for ${activeLocale} saved successfully!`)
    } catch (error) {
      console.error("Error saving translations:", error)
      alert("Failed to save translations")
    } finally {
      setIsSaving(false)
    }
  }

  // Fonction pour aplatir l'objet de traductions pour la recherche
  const flattenTranslations = (obj: Record<string, any>, prefix = ""): Record<string, string> => {
    return Object.keys(obj).reduce(
      (acc, key) => {
        const prefixedKey = prefix ? `${prefix}.${key}` : key
        if (typeof obj[key] === "object" && obj[key] !== null) {
          Object.assign(acc, flattenTranslations(obj[key], prefixedKey))
        } else {
          acc[prefixedKey] = obj[key]
        }
        return acc
      },
      {} as Record<string, string>,
    )
  }

  // Filtrer les traductions en fonction du terme de recherche
  const filteredTranslations = searchTerm
    ? Object.entries(flattenTranslations(translations)).filter(
        ([key, value]) =>
          key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  // Rendu des traductions sous forme de formulaire récursif
  const renderTranslationForm = (obj: Record<string, any>, path: string[] = []) => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = [...path, key]
      const pathString = currentPath.join(".")

      if (typeof value === "object" && value !== null) {
        return (
          <div key={pathString} className="mb-6">
            <h3 className="text-lg font-medium mb-2">{key}</h3>
            <div className="pl-4 border-l-2 border-gray-200">{renderTranslationForm(value, currentPath)}</div>
          </div>
        )
      }

      return (
        <div key={pathString} className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label htmlFor={pathString} className="text-sm font-medium">
            {pathString}
          </label>
          <Input
            id={pathString}
            value={value as string}
            onChange={(e) => updateTranslation(currentPath, e.target.value)}
            className="md:col-span-2"
          />
        </div>
      )
    })
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Translation Management</CardTitle>
          <CardDescription>Edit and manage translations for your application</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeLocale} onValueChange={setActiveLocale}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="fr">Français</TabsTrigger>
                <TabsTrigger value="es">Español</TabsTrigger>
              </TabsList>
              <Button onClick={saveTranslations} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            <div className="mb-6">
              <Input
                placeholder="Search translations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <>
                {searchTerm ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Search Results</h3>
                    {filteredTranslations.length === 0 ? (
                      <p>No results found</p>
                    ) : (
                      filteredTranslations.map(([key, value]) => (
                        <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <label htmlFor={key} className="text-sm font-medium">
                            {key}
                          </label>
                          <Input
                            id={key}
                            value={value}
                            onChange={(e) => {
                              const path = key.split(".")
                              updateTranslation(path, e.target.value)
                            }}
                            className="md:col-span-2"
                          />
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <TabsContent value={activeLocale} className="mt-0">
                    <div className="space-y-6">{renderTranslationForm(translations)}</div>
                  </TabsContent>
                )}
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
