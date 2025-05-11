"use client"

import { ServiceTable } from "@/components/service-table"

export function ServicesContent() {
  // Données fictives pour les services
  const servicesData = [
    {
      id: 1,
      image: "/images/babysitter.jpg",
      name: "Baby-sitter",
      provider: "Florence",
      pricing: "£17/hour",
      grade: 5,
    },
    {
      id: 2,
      image: "/images/dogsitter.jpg",
      name: "Dog-sitter",
      provider: "Charlotte",
      pricing: "£20/hour",
      grade: 4,
    },
    {
      id: 3,
      image: "/images/airport.jpg",
      name: "Ride to the airport",
      provider: "Samy",
      pricing: "£30 + £2/km",
      grade: 5,
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Services</h1>
      <ServiceTable data={servicesData} />
    </div>
  )
}

