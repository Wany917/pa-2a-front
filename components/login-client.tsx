"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"

export default function LoginClient() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberPassword, setRememberPassword] = useState(false)
  const { t } = useLanguage()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Ici vous pouvez ajouter la logique d'authentification
    console.log("Login attempt with:", { email, password, rememberPassword })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md mx-auto">
        <h1 className="text-xl sm:text-2xl font-semibold text-center mb-4">{t("auth.loginToAccount")}</h1>

        <p className="text-gray-600 text-center mb-6">{t("auth.pleaseEnterEmailPassword")}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-2">
              {t("auth.emailAddress")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.emailAddress")}
              className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
              required
            />
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
              <label htmlFor="password" className="block text-gray-700">
                {t("auth.password")}
              </label>
              <Link href="/forgot-password" className="text-gray-500 text-sm hover:text-green-50 mt-1 sm:mt-0">
                {t("auth.forgetPassword")}
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.password")}
              className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              checked={rememberPassword}
              onChange={(e) => setRememberPassword(e.target.checked)}
              className="h-4 w-4 text-green-50 border-gray-300 rounded focus:ring-green-50"
            />
            <label htmlFor="remember" className="ml-2 block text-gray-700">
              {t("auth.rememberPassword")}
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-50 text-white rounded-md hover:bg-green-400 transition-colors"
          >
            {t("auth.signIn")}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-gray-600">{t("auth.dontHaveAccount")} </span>
          <Link href="/signin" className="text-green-50 hover:underline">
            {t("auth.createAccount")}
          </Link>
        </div>
      </div>
    </div>
  )
}

