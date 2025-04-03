"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import LanguageSelector from "@/components/language-selector"

export default function DeliveryManRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation basique
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsSubmitting(true)

    try {
      // Simuler l'envoi des données d'inscription (à remplacer par votre logique réelle)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log("Delivery man registration:", formData)
      router.push("/verify-email") // Rediriger vers la vérification d'email
    } catch (err) {
      setError("Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-200">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-2">Create an Account</h1>
        <p className="text-gray-600 text-center mb-6">Create an account as a Delivery man</p>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-center text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email address:
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-gray-700 mb-1">
              Phone number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 mb-1">
              Confirm your password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-green-300 text-gray-700 rounded-md hover:bg-green-400 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <span className="text-gray-600">Already have an account? </span>
          <Link href="/login" className="text-green-500 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

