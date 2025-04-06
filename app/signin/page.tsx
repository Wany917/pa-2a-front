"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDownIcon } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    firstname: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    accountType: "User",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  const countries = ["France", "United Kingdom", "Germany", "Spain", "Italy", "Belgium", "Netherlands", "Switzerland"]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const selectCountry = (country: string) => {
    setFormData((prev) => ({ ...prev, country }))
    setShowCountryDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simuler l'envoi des données d'inscription (à remplacer par votre logique réelle)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Rediriger vers la page de vérification d'email
      console.log("Signup attempt with:", formData)
      router.push("/verify-email")
    } catch (error) {
      console.error("Signup error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-5xl mx-4 my-8">
        <h1 className="text-2xl font-semibold text-center mb-2">Create an Account</h1>

        <p className="text-gray-600 text-center mb-8">Create an account to continue</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Première colonne */}
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="firstname" className="block text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-gray-700 mb-2">
                  Date of birth
                </label>
                <div className="relative">
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="text"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    placeholder="Enter your date of birth"
                    className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                    required
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => (e.target.type = "text")}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="accountType" className="block text-gray-700 mb-2">
                  Type of account
                </label>
                <div className="relative">
                  <input
                    id="accountType"
                    name="accountType"
                    type="text"
                    value="Client"
                    className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50 text-gray-500"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Deuxième colonne */}
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-gray-700 mb-2">
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                  Confirm your password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>
            </div>

            {/* Troisième colonne */}
            <div className="space-y-6">
              <div>
                <label htmlFor="address" className="block text-gray-700 mb-2">
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-gray-700 mb-2">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-gray-700 mb-2">
                  Postal code
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Enter your postal code"
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-gray-700 mb-2">
                  Country
                </label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50 text-left flex justify-between items-center"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    <span>{formData.country || "Select your country"}</span>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  </button>

                  {showCountryDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {countries.map((country) => (
                        <button
                          key={country}
                          type="button"
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => selectCountry(country)}
                        >
                          {country}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-3 bg-green-50 text-white rounded-md hover:bg-green-400 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </button>

            <div className="mt-4 text-center">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/login" className="text-green-50 hover:underline">
                Login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}