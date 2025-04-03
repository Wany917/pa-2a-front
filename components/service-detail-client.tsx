"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Star, User } from "lucide-react"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"

// Type pour les services
interface Service {
  id: number
  title: string
  image: string
  description: string
  price: string
  rating: number
  provider: string
}

export default function ServiceDetailClient({ id }: { id: string }) {
  const { t } = useLanguage()
  const serviceId = id
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9, 1)) // Octobre 2025
  const [view, setView] = useState<"day" | "week" | "month">("month")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Simuler le chargement des données du service
  useEffect(() => {
    // Données fictives des services
    const services: Service[] = [
      {
        id: 1,
        title: t("services.babySitter"),
        image: "/baby-sitter.jpg",
        description: t("services.babySitterDesc"),
        price: "£17/hour",
        rating: 5,
        provider: "Emma",
      },
      {
        id: 2,
        title: t("services.dogSitter"),
        image: "/dog-sitter.jpg",
        description: t("services.dogSitterDesc"),
        price: "£20/hour",
        rating: 5,
        provider: "Charlotte",
      },
      {
        id: 3,
        title: t("services.airportRide"),
        image: "/airport-ride.jpg",
        description: t("services.airportRideDesc"),
        price: "£30 + £2/km",
        rating: 5,
        provider: "Thomas",
      },
    ]

    // Trouver le service correspondant à l'ID
    const foundService = services.find((s) => s.id.toString() === serviceId)

    // Simuler un délai de chargement
    setTimeout(() => {
      setService(foundService || null)
      setLoading(false)
    }, 500)
  }, [serviceId, t])

  // Fonction pour générer les jours du mois
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1)
    const days = []

    // Ajouter les jours du mois précédent pour compléter la première semaine
    const firstDay = date.getDay() || 7 // 0 = dimanche, 1 = lundi, etc. Convertir 0 en 7 pour lundi comme premier jour
    const prevMonthDays = firstDay - 1

    const prevMonth = month === 0 ? 11 : month - 1
    const prevMonthYear = month === 0 ? year - 1 : year
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate()

    for (let i = daysInPrevMonth - prevMonthDays + 1; i <= daysInPrevMonth; i++) {
      days.push({
        date: new Date(prevMonthYear, prevMonth, i),
        isCurrentMonth: false,
        events: [],
      })
    }

    // Ajouter les jours du mois actuel
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        events: getEventsForDate(new Date(year, month, i)),
      })
    }

    // Ajouter les jours du mois suivant pour compléter la dernière semaine
    const lastDay = new Date(year, month, daysInMonth).getDay() || 7
    const nextMonthDays = 7 - lastDay

    const nextMonth = month === 11 ? 0 : month + 1
    const nextMonthYear = month === 11 ? year + 1 : year

    for (let i = 1; i <= nextMonthDays; i++) {
      days.push({
        date: new Date(nextMonthYear, nextMonth, i),
        isCurrentMonth: false,
        events: [],
      })
    }

    return days
  }

  // Fonction pour obtenir les événements pour une date donnée
  const getEventsForDate = (date: Date) => {
    const events = [
      { id: 1, name: "Design Conference", date: new Date(2025, 9, 3), color: "bg-blue-200" },
      { id: 2, name: "Weekend Festival", date: new Date(2025, 9, 23), color: "bg-pink-200" },
      { id: 3, name: "Glastonbury Festival", date: new Date(2025, 9, 27), color: "bg-orange-200" },
      { id: 4, name: "Glastonbury Festival", date: new Date(2025, 9, 31), color: "bg-blue-200" },
    ]

    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  // Fonction pour naviguer entre les mois
  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth)
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  // Obtenir les jours du mois actuel
  const days = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth())

  // Formater le mois et l'année pour l'affichage
  const monthYearFormat = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(currentMonth)

  // Jours de la semaine
  const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

  // Afficher un état de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  // Afficher un message si le service n'est pas trouvé
  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">{t("services.serviceNotFound")}</h1>
        <Link
          href="/dashboard"
          className="bg-green-50 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          {t("navigation.backToDashboard")}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-NEF7Y3VVan4gaPKz0Ke4Q9FTKCgie4.png"
                alt="EcoDeli Logo"
                width={120}
                height={40}
                className="h-auto"
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard/announcements" className="text-gray-700 hover:text-green-500">
              {t("navigation.myAnnouncements")}
            </Link>
            <Link href="/dashboard/payments" className="text-gray-700 hover:text-green-500">
              {t("navigation.myPayments")}
            </Link>
            <Link href="/dashboard/messages" className="text-gray-700 hover:text-green-500">
              {t("navigation.messages")}
            </Link>
            <Link href="/dashboard/complaint" className="text-gray-700 hover:text-green-500">
              {t("navigation.makeComplaint")}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSelector />

            <Link
              href="/dashboard"
              className="flex items-center bg-green-200 text-green-800 rounded-full px-4 py-1 hover:bg-green-300 transition-colors"
            >
              <User className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Killian</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-green-500">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("navigation.backToDashboard")}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Service Details */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64">
                <Image
                  src={service.image || "/placeholder.svg?height=300&width=400"}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">{service.title}</h1>
                <h2 className="text-xl mb-2">{service.provider}</h2>

                <div className="flex mb-4">
                  {[...Array(service.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-600 mb-6">{service.description}</p>

                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">{t("services.price")} :</span>
                    <span>{service.price}</span>
                  </li>
                </ul>

                <div className="space-y-3">
                  <button className="w-full py-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    {t("services.selectDate")}
                  </button>

                  <button className="w-full py-3 bg-green-50 text-white rounded-md hover:bg-green-600 transition-colors">
                    {t("services.payNow")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="text-sm text-gray-500">{t("services.today")}</div>

                <div className="flex items-center space-x-2">
                  <button onClick={() => navigateMonth("prev")} className="p-1 rounded-full hover:bg-gray-100">
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <h2 className="text-lg font-semibold">{monthYearFormat}</h2>

                  <button onClick={() => navigateMonth("next")} className="p-1 rounded-full hover:bg-gray-100">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setView("day")}
                    className={`px-3 py-1 text-sm rounded-md ${view === "day" ? "bg-green-200 text-green-800" : ""}`}
                  >
                    {t("services.day")}
                  </button>
                  <button
                    onClick={() => setView("week")}
                    className={`px-3 py-1 text-sm rounded-md ${view === "week" ? "bg-green-200 text-green-800" : ""}`}
                  >
                    {t("services.week")}
                  </button>
                  <button
                    onClick={() => setView("month")}
                    className={`px-3 py-1 text-sm rounded-md ${view === "month" ? "bg-green-200 text-green-800" : ""}`}
                  >
                    {t("services.month")}
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {/* Weekday Headers */}
                {weekdays.map((day, index) => (
                  <div key={index} className="bg-white p-2 text-center text-sm font-medium">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={`bg-white p-2 min-h-[60px] sm:min-h-[80px] ${!day.isCurrentMonth ? "text-gray-400" : ""}`}
                  >
                    <div className="text-right">{day.date.getDate()}</div>

                    {/* Events */}
                    {day.events.map((event) => (
                      <div key={event.id} className={`${event.color} p-1 text-xs mt-1 truncate rounded`}>
                        {event.name}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

