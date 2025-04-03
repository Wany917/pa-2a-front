"use client"

import type React from "react"

import { useState } from "react"

interface CheckoutButtonProps {
  planName: string
  priceId: string
  children: React.ReactNode
}

export default function CheckoutButton({ planName, priceId, children }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planName,
          priceId: priceId,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error("Error creating checkout session:", data.error)
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error:", error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className={`w-full py-2 px-4 rounded-md transition-colors ${
        planName === "Premium"
          ? "bg-white text-green-500 hover:bg-green-50"
          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
      }`}
    >
      {isLoading ? "Loading..." : children}
    </button>
  )
}

