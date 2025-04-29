"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDownIcon, CheckIcon } from "lucide-react"

type AccountType = "Client" | "Delivery" | "Provider" | "Merchant"

interface AccountOption {
  id: AccountType
  label: string
  requiresDocuments: boolean
}

export default function SignupPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    firstname: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  })

  const [selectedAccounts, setSelectedAccounts] = useState<AccountType[]>(["Client"])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)

  const countries = ["France", "United Kingdom", "Germany", "Spain", "Italy", "Belgium", "Netherlands", "Switzerland"]

  const accountOptions: AccountOption[] = [
    { id: "Client", label: "Client", requiresDocuments: false },
    { id: "Delivery", label: "Delivery Man", requiresDocuments: true },
    { id: "Provider", label: "Service Provider", requiresDocuments: true },
    { id: "Merchant", label: "Merchant", requiresDocuments: true },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const selectCountry = (country: string) => {
    setFormData((prev) => ({ ...prev, country }))
    setShowCountryDropdown(false)
  }

  const toggleAccountType = (accountType: AccountType) => {
    setSelectedAccounts((prev) => {
      if (accountType === "Client" && prev.includes("Client")) return prev
      if (prev.includes(accountType)) return prev.filter((type) => type !== accountType)
      return [...prev, accountType]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const genRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/codes-temporaire/generate-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_info: JSON.stringify(formData)
          }),
        }
      )
      if (!genRes.ok) {
        console.log(JSON.stringify({ user_info: JSON.stringify(formData) }))
        throw new Error("failed to generate code")
      }
      const { code: verificationCode } = await genRes.json()
      
      await fetch(process.env.NEXT_PUBLIC_API_URL + "/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: formData.email,
          subject: "Your EcoDeli Verification Code",
          body: `
            <h2>Welcome to EcoDeli 👋</h2>
            <p>Thank you for signing up, ${formData.firstname}!</p>
            <p>Your verification code is:</p>
            <h3 style="font-size: 24px; color: #10B981;">${verificationCode}</h3>
            <p>Please enter this code to verify your account.</p>
          `,
        }),
      })

      const requiresDocuments = selectedAccounts.some(
        (type) => accountOptions.find((opt) => opt.id === type)?.requiresDocuments,
      )

      if (requiresDocuments) {
        router.push("/documents-verification")
      } else {
        sessionStorage.setItem(
          "signupInfo",
          JSON.stringify({ formData })
        )
        router.push("/verify-email")
      }
    } catch (error) {
      console.error("Error sending email:", error)
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
                <label className="block text-gray-700 mb-2">Account Types</label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50 text-left flex justify-between items-center"
                    onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  >
                    <span>
                      {selectedAccounts.length === 1
                        ? accountOptions.find((opt) => opt.id === selectedAccounts[0])?.label
                        : `${selectedAccounts.length} account types selected`}
                    </span>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  </button>

                  {showAccountDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {accountOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className="flex w-full text-left px-4 py-2 hover:bg-gray-100 justify-between items-center"
                          onClick={() => toggleAccountType(option.id)}
                          disabled={option.id === "Client"}
                        >
                          <span>{option.label}</span>
                          {selectedAccounts.includes(option.id) && <CheckIcon className="h-4 w-4 text-green-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedAccounts.some((type) => type !== "Client") && (
                  <p className="text-sm text-amber-600 mt-2">
                    Note: Additional documents will be required for the selected professional accounts.
                  </p>
                )}
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