"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Bell, Camera, Check, Upload, X } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"

export default function AddServicePage() {
  const router = useRouter()
  const { t } = useLanguage()

  // État pour suivre l'étape actuelle
  const [currentStep, setCurrentStep] = useState(1)

  // États pour les données du formulaire
  const [serviceName, setServiceName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)

  // États pour les pièces justificatives
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentName, setDocumentName] = useState("")
  const [isDocumentDragging, setIsDocumentDragging] = useState(false)

  // État pour le chargement
  const [isLoading, setIsLoading] = useState(false)

  // Gestion de l'image du service
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleImageDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0] ?? null
    if (file && file.type.startsWith("image/")) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImageFile(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview("")
    }
  }

  // Gestion du document justificatif
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (file) {
      setDocumentFile(file)
      setDocumentName(file.name)
    }
  }

  const handleDocumentDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDocumentDragging(true)
  }

  const handleDocumentDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDocumentDragging(false)
  }

  const handleDocumentDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDocumentDragging(false)

    const file = e.dataTransfer.files?.[0] ?? null
    if (file) {
      setDocumentFile(file)
      setDocumentName(file.name)
    }
  }

  const removeDocument = () => {
    setDocumentFile(null)
    setDocumentName("")
  }

  // Validation de l'étape 1
  const isStep1Valid =
    serviceName.trim() !== "" && price.trim() !== "" && description.trim() !== "" && imageFile !== null

  // Validation de l'étape 2
  const isStep2Valid = documentFile !== null

  // Passer à l'étape suivante
  const goToNextStep = () => {
    if (currentStep === 1 && isStep1Valid) {
      setCurrentStep(2)
    }
  }

  // Revenir à l'étape précédente
  const goToPreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  // Soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isStep2Valid) return

    setIsLoading(true)

    // Simuler une requête API
    setTimeout(() => {
      setIsLoading(false)
      router.push("/app_service-provider/services/pending-validation")
    }, 1500)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header avec bouton de traduction */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-green-50 hover:bg-green-50/10 p-2 h-auto"
            onClick={() => router.push("/app_service-provider/services")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t("common.back")}</h1>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
        </div>
      </div>

      {/* Indicateur d'étapes */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-xs mx-auto">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? "bg-green-50 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {currentStep > 1 ? <Check className="h-5 w-5" /> : "1"}
            </div>
            <span className="text-sm mt-1">{t("serviceProvider.details")}</span>
          </div>

          <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? "bg-green-50" : "bg-gray-200"}`}></div>

          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? "bg-green-50 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
            <span className="text-sm mt-1">{t("serviceProvider.verification")}</span>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-lg rounded-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Étape 1: Détails du service */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Upload d'image */}
                <div className="flex flex-col items-center mb-6">
                  <div
                    className={`w-32 h-32 rounded-full overflow-hidden border-2 ${
                      isDragging ? "border-green-50 bg-green-50/5" : "border-gray-300"
                    } flex items-center justify-center relative cursor-pointer mb-2`}
                    onDragOver={handleImageDragOver}
                    onDragLeave={handleImageDragLeave}
                    onDrop={handleImageDrop}
                    onClick={() => document.getElementById("service-image")?.click()}
                  >
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage()
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <Camera className="h-10 w-10 text-gray-400" />
                    )}
                    <input
                      type="file"
                      id="service-image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-green-50">{t("serviceProvider.uploadPhoto")}</p>
                </div>

                {/* Nom du service */}
                <div className="space-y-2">
                  <Label htmlFor="service-name" className="text-base font-medium">
                    {t("serviceProvider.name")}
                  </Label>
                  <Input
                    id="service-name"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder={t("serviceProvider.namePlaceholder")}
                    className="h-12"
                    required
                  />
                </div>

                {/* Prix */}
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-base font-medium">
                    {t("serviceProvider.price")}
                  </Label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                    <Input
                      id="price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={t("serviceProvider.pricePlaceholder")}
                      className="pl-8 h-12"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-medium">
                    {t("serviceProvider.description")}
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("serviceProvider.descriptionPlaceholder")}
                    rows={5}
                    className="resize-none"
                    required
                  />
                </div>

                {/* Bouton pour passer à l'étape suivante */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    className="bg-green-50 hover:bg-green-600 text-white px-6"
                    onClick={goToNextStep}
                    disabled={!isStep1Valid}
                  >
                    {t("common.next")}
                  </Button>
                </div>
              </div>
            )}

            {/* Étape 2: Pièce justificative */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">{t("serviceProvider.documentTitle")}</h2>
                <p className="text-gray-600 mb-6">{t("serviceProvider.documentDescription")}</p>

                {/* Upload de document */}
                <div
                  className={`border-2 border-dashed rounded-xl p-8 transition-colors ${
                    isDocumentDragging ? "border-green-50 bg-green-50/5" : "border-gray-300"
                  }`}
                  onDragOver={handleDocumentDragOver}
                  onDragLeave={handleDocumentDragLeave}
                  onDrop={handleDocumentDrop}
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    {documentFile ? (
                      <div className="w-full bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-50/20 p-2 rounded-md">
                            <Check className="h-5 w-5 text-green-50]" />
                          </div>
                          <span className="font-medium">{documentName}</span>
                        </div>
                        <button type="button" onClick={removeDocument} className="text-red-500 hover:text-red-700">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-green-50" />
                        <div className="text-center">
                          <p className="text-lg font-medium mb-1">{t("serviceProvider.dropDocument")}</p>
                          <p className="text-sm text-gray-500 mb-4">{t("serviceProvider.documentFormat")}</p>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-green-50 text-green-50 hover:bg-green-50 hover:text-white"
                            onClick={() => document.getElementById("document-file")?.click()}
                          >
                            {t("serviceProvider.browseFiles")}
                          </Button>
                        </div>
                        <input
                          type="file"
                          id="document-file"
                          accept=".pdf"
                          onChange={handleDocumentChange}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Boutons de navigation */}
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={goToPreviousStep} disabled={isLoading}>
                    {t("common.back")}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-50 hover:bg-green-600 text-white px-6"
                    disabled={!isStep2Valid || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        {t("common.creating")}
                      </>
                    ) : (
                      t("common.create")
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
