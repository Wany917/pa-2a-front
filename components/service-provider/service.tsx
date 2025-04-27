"use client"

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
  Calendar,
  Star,
  LayoutList,
  User,
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Définition du type Service
interface Service {
  id: number
  name: string
  description: string
  price: string
  rating: number
  image: string
}

export default function ServiceProviderPage() {
  const { t } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [services, setServices] = useState<Service[]>([
    {
      id: 1,
      name: "Dog-sitter",
      description:"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.",
      price: "£20/hour",
      rating: 5,
      image: "/dog-sitter.jpg",
    },
  ])

  // Fonction pour rendre les étoiles
  const renderStars = (rating: number) => {
    const stars: JSX.Element[] = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-5 w-5 fill-[#FFD700] text-[#FFD700]" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="h-5 w-5 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="h-5 w-5 fill-[#FFD700] text-[#FFD700]" />
            </div>
          </div>
        )
      } else {
        stars.push(<Star key={i} className="h-5 w-5 text-gray-300" />)
      }
    }

    return <div className="flex">{stars}</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
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
                <Link href="/app_service-provider" className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100">
                  <BarChart3 className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.dashboard")}</span>
                </Link>
              </li>
              <li>
                <Link href="/app_service-provider/review" className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100">
                  <Star className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.review")}</span>
                </Link>
              </li>
              <li>
                <Link href="/app_service-provider/services" className="flex items-center rounded-md bg-green-50 px-4 py-3 text-white">
                  <Tag className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.services")}</span>
                </Link>
              </li>
              <li>
                <Link href="/app_service-provider/calendar" className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100">
                  <Calendar className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.calendar")}</span>
                </Link>
              </li>
              <li>
                <Link href="/app_service-provider/interventions" className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100">
                  <LayoutList className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.interventions")}</span>
                </Link>
              </li>
              <li>
                <Link href="/app_service-provider/messages" className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100">
                  <MessageSquare className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.messages")}</span>
                </Link>
              </li>
              <li>
                <Link href="/app_service-provider/payments" className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100">
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
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden">
            <Menu className="h-6 w-6" />
          </button>

          {/* Right actions */}
          <div className="ml-auto flex items-center space-x-4">
            <LanguageSelector />
            {/* User menu */}
            <div className="relative">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors">
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Charlotte</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100">
                  <Link href="/app_service-provider/edit_account" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <Edit className="h-4 w-4 mr-2" />
                    <span>{t("common.editAccount")}</span>
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <div className="px-4 py-1 text-xs text-gray-500">{t("common.registerAs")}</div>
                  <Link href="/register/shopkeeper" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.shopkeeper")}
                  </Link>
                  <Link href="/register/deliveryman" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.deliveryMan")}
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-6 mr-6">
          <h1 className="text-2xl font-bold ml-6">{t("serviceProvider.services")}</h1>
          <Link href="/app_service-provider/services/add" className="hidden sm:block">
            <Button className="bg-green-50 hover:bg-green-50 text-white">
              {t("serviceProvider.addService")}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-6">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden border shadow-sm">
              <div className="relative h-48 w-full overflow-hidden">
                <Image src={service.image || "/placeholder.svg"} alt={service.name} fill className="object-cover" />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{service.name}</h2>
                  <div className="flex">{renderStars(service.rating)}</div>
                </div>
                <p className="text-gray-600 mb-4 h-24 overflow-hidden">{service.description}</p>
                <div className="flex justify-between items-center">
                  <span className="bg-green-50 bg-opacity-20 text-green-50 px-4 py-2 rounded-full text-sm">
                    {service.price}
                  </span>
                  <Link key={service.id} href={`/app_service-provider/services/${service.id}`}>   
                    <Button variant="outline" className="border-green-50 text-green-50 hover:bg-green-50 hover:text-white">
                      {t("common.edit")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}