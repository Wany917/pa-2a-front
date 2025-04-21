"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"

export default function VerifyEmailClient() {
  const router = useRouter()
  const { t } = useLanguage()
  const [code, setCode] = useState<string[]>(Array(6).fill(""))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialiser les refs pour les 6 champs de saisie
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6)
  }, [])

  // Gérer le compte à rebours pour le renvoi du code
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && !canResend) {
      setCanResend(true)
    }
  }, [countdown, canResend])

  const handleChange = (index: number, value: string) => {
    // Vérifier que l'entrée est un chiffre
    if (value && !/^\d*$/.test(value)) return

    // Mettre à jour le code
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Passer au champ suivant si un chiffre est entré
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Passer au champ précédent si la touche Backspace est pressée et que le champ est vide
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Vérifier que les données collées sont des chiffres et de la bonne longueur
    if (/^\d{1,6}$/.test(pastedData)) {
      const newCode = [...code]

      // Remplir les champs avec les chiffres collés
      for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
        newCode[i] = pastedData[i]
      }

      setCode(newCode)

      // Mettre le focus sur le dernier champ rempli ou le suivant
      const focusIndex = Math.min(pastedData.length, 5)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const verificationCode = code.join("")

    // Vérifier que le code est complet
    if (verificationCode.length !== 6) {
      setError(t("auth.pleaseEnterCompleteCode"))
      setIsSubmitting(false)
      return
    }

    try {
      // Simuler une vérification du code (à remplacer par votre logique réelle)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Si le code est correct, rediriger vers la page d'accueil ou le tableau de bord
      console.log("Code verified:", verificationCode)
      router.push("/verification-success")
    } catch (err) {
      setError(t("auth.invalidVerificationCode"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (!canResend) return

    setCanResend(false)

    try {
      // Simuler l'envoi d'un nouveau code (à remplacer par votre logique réelle)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Réinitialiser le compte à rebours
      setCountdown(60)
      console.log("Code resent")
    } catch (err) {
      setCanResend(true)
      setError(t("auth.failedToResendCode"))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="absolute top-4 right-4 mr-8">
        <LanguageSelector />
      </div>

      <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto mx-auto" />
        </div>

        <h1 className="text-2xl font-semibold text-center mb-2">{t("auth.verifyEmail")}</h1>

        <p className="text-gray-600 text-center mb-8">{t("auth.verificationCodeSent")}</p>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-6 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center space-x-2">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                ref={(el: HTMLInputElement | null) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={code[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-xl font-bold rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                required
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-green-50 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-70"
          >
            {isSubmitting ? t("auth.verifyingEmail") : t("auth.verifyEmail")}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600 mb-2">{t("auth.didntReceiveCode")}</p>
          <button
            onClick={handleResendCode}
            disabled={!canResend}
            className="text-green-50 hover:underline disabled:text-gray-400 disabled:no-underline"
          >
            {canResend ? t("auth.resendCode") : `${t("auth.resendCodeIn")} ${countdown}s`}
          </button>
        </div>

        <div className="text-center mt-6">
          <Link href="/signin" className="text-gray-500 hover:text-green-50">
            {t("auth.backToSignUp")}
          </Link>
        </div>
      </div>
    </div>
  )
}

