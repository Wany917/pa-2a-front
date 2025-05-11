"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
import { Package, ChevronDown } from "lucide-react"

const DeliveryDetailClient = ({ id }: { id: string }) => {
  const { t } = useLanguage()
  const [delivery, setDelivery] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState<string[]>(Array(6).fill("")) // État pour les 6 chiffres
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Simulate fetching delivery data
    const fetchDelivery = async () => {
      setLoading(true)
      try {
        const mockDelivery = {
          id,
          name: "Pair of running shoes",
          image: "/running-shoes.jpg",
          sender: "Charlotte A.",
          deliveryAddress: "11 rue Erard, Paris 75012",
          price: "£20",
          deliveryDate: "15th May - 30th May",
          amount: 1,
          storageBox: "242 rue Faubourg Saint Antoine, Paris 75012",
          size: "Small",
          status: "The package is in the mailbox",
          timeAway: "1 hour away",
        }

        setDelivery(mockDelivery)
      } catch (error) {
        console.error("Error fetching delivery:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDelivery()
  }, [id])

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    if (/^\d{1,6}$/.test(pastedData)) {
      const newCode = [...code]
      for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
        newCode[i] = pastedData[i]
      }
      setCode(newCode)

      const focusIndex = Math.min(pastedData.length, 5)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    const verificationCode = code.join("")
    setTimeout(() => {
      if (verificationCode === "123456") {
        alert(t("deliveryman.codeValidated"))
      } else {
        alert(t("deliveryman.invalidCode"))
      }
      setIsSubmitting(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!delivery) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">{t("deliveryman.deliveries.deliveryNotFound")}</h2>
        <Link href="/app_deliveryman/deliveries" className="text-green-500 hover:text-green-600 transition-colors">
          {t("deliveryman.deliveries.backToDeliveries")}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 flex justify-between items-center shadow-sm">
        <Link href="/app_deliveryman" className="flex items-center">
          <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
        </Link>

        <div className="flex items-center mr-20">
          <LanguageSelector />
        </div>
      </header>

      <div className="p-6">
        <div className="mb-6">
          <Link href="/app_deliveryman" className="text-green-500 hover:underline flex items-center">
            <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
            {t("deliveryman.backToDeliveries")}
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">{t("deliveryman.deliveryDetails")}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Delivery information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-center mb-6">
              <div className="relative w-full max-w-md h-64">
                <Image src="/running-shoes.jpg" alt={delivery.name} fill className="object-contain rounded-md" />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4">{delivery.name}</h2>

            <div className="space-y-3">
              <p>
                <span className="font-medium">{t("deliveryman.deliveryFor")}</span> {delivery.sender}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.deliveryAddress")}</span>:{" "}
                {delivery.deliveryAddress}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.priceForDelivery")}</span>: {delivery.price}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.deliveryDate")}</span>: {delivery.deliveryDate}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.amount")}</span>: {delivery.amount}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.storageBox")}</span>: {delivery.storageBox}
              </p>

              <div className="flex items-center mt-4">
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                  <Package className="w-4 h-4 mr-1" />
                  {delivery.size}
                </span>
              </div>
            </div>
          </div>

          {/* Right column - Code validation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">{t("deliveryman.enterCode")}</h2>
            <p className="text-gray-600 mb-4">{t("deliveryman.enterCodeDescription")}</p>

            <div className="flex justify-center space-x-2 mb-6">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={code[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-xl font-bold rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || code.some((digit) => digit === "")}
              className={`w-full py-2 rounded-md text-white ${
                isSubmitting || code.some((digit) => digit === "")
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isSubmitting ? t("deliveryman.validatingCode") : t("deliveryman.validateCode")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryDetailClient