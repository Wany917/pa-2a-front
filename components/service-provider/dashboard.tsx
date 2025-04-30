"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  BarChart3,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquare,
  Tag,
  Edit,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Star,
  LayoutList,
  User,
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export default function ServiceProviderDashboard() {
  const { t } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState("April")

  // Données fictives pour les prestations à venir
  const upcomingServices = [
    {
      id: 1,
      client: "Sophie Martin",
      service: "Dog-sitter",
      date: "2025-04-23",
      time: "14:00 - 16:00",
      location: "15 rue de Paris, 75001 Paris",
      status: "Confirmed",
    },
    {
      id: 2,
      client: "Thomas Dubois",
      service: "Dog-sitter",
      date: "2025-04-24",
      time: "10:00 - 12:00",
      location: "8 avenue Victor Hugo, 75016 Paris",
      status: "Pending",
    },
    {
      id: 3,
      client: "Marie Leroy",
      service: "Dog-sitter",
      date: "2025-04-25",
      time: "15:30 - 17:30",
      location: "22 boulevard Saint-Michel, 75005 Paris",
      status: "Confirmed",
    },
    {
      id: 4,
      client: "Pierre Moreau",
      service: "Dog-sitter",
      date: "2025-04-26",
      time: "09:00 - 11:00",
      location: "5 rue de Rivoli, 75004 Paris",
      status: "Confirmed",
    },
    {
      id: 5,
      client: "Julie Bernard",
      service: "Dog-sitter",
      date: "2025-04-27",
      time: "16:00 - 18:00",
      location: "12 rue de Vaugirard, 75006 Paris",
      status: "Pending",
    },
  ]

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
    return new Date(dateString).toLocaleDateString("en-GB", options)
  }

  // Fonction pour rendre le badge de statut avec la bonne couleur
  const renderStatusBadge = (status: string) => {
    let bgColor = ""

    switch (status.toLowerCase()) {
      case "confirmed":
        bgColor = "bg-[#8CD790] text-white"
        break
      case "pending":
        bgColor = "bg-[#F8A097] text-white"
        break
      case "cancelled":
        bgColor = "bg-[#E57373] text-white"
        break
      default:
        bgColor = "bg-gray-200 text-gray-800"
    }

    return <Badge className={`${bgColor} font-normal`}>{status}</Badge>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/app_service-provider" className="flex items-center">
              <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/app_service-provider"
                  className="flex items-center rounded-md bg-green-50 px-4 py-3 text-white"
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.dashboard")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/review"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <Star className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.review")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/services"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <Tag className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.services")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/calendar"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.calendar")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/interventions"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <LayoutList className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.interventions")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/messages"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <MessageSquare className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.messages")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/payments"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <CreditCard className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.payments")}</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Right actions */}
          <div className="ml-auto flex items-center space-x-4">
            <LanguageSelector />

            {/* User menu - style adapté du dashboard client */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors"
              >
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Charlotte</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100">
                <Link
                  href="/app_service-provider/edit_account"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  <span>{t("common.editAccount")}</span>
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                  <User className="h-4 w-4 mr-2" />
                  {t("common.clientSpace")}
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <div className="px-4 py-1 text-xs text-gray-500">{t("common.accessToSpace")}</div>

                <Link href="/register/shopkeeper" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  {t("common.shopkeeper")}
                </Link>

                <Link href="/register/deliveryman" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  {t("common.deliveryMan")}
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <Link href="/logout" className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>{t("common.logout")}</span>
                </Link>
              </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <h1 className="mb-6 text-2xl font-bold">{t("serviceProvider.dashboard")}</h1>

       {/* Tableau des prestations à venir */}
    <Card className="border-none shadow-md">
        <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">{t("serviceProvider.upcomingInterventions")}</h2>
        </div>
        <div className="p-4">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Client</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Service</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {upcomingServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{service.client}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{service.service}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(service.date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{service.time}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate">{service.location}</td>
                    <td className="px-6 py-4 text-sm">{renderStatusBadge(service.status)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
    </Card>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Nombre de clients */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-8">Number of client</h3>
          <div className="flex flex-col items-center justify-center">
            <p className="text-5xl font-bold mb-6">83.9 K</p>
            <div className="bg-[#8CD790] bg-opacity-20 text-[#8CD790] px-4 py-2 rounded-full text-sm">
              +9.7 K this month
            </div>
          </div>
        </Card>

        {/* Meilleur service */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Best service</h3>
          <p className="text-center font-medium mb-4">Dog-sitter</p>
          <div className="flex justify-center mb-4">
            <div className="relative w-40 h-40 rounded-lg overflow-hidden">
              <Image
                src="/dog-sitter.jpg"
                alt="Dog-sitter"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </Card>

        {/* Chiffres du mois */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-8">Numbers of the month</h3>
          <div className="flex flex-col items-center justify-center">
            <p className="text-5xl font-bold mb-6">£ 4.5 K</p>
            <div className="bg-[#8CD790] bg-opacity-20 text-[#8CD790] px-4 py-2 rounded-full text-sm">
              +5.4% than last month
            </div>
          </div>
        </Card>
      </div>
    </main>
  </div>
</div>
    )
}