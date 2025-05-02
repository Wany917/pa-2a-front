"use client";
import React from 'react';
import { useLanguage } from "@/components/language-context";
import link from "next/link";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/language-selector";
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Planning from '@/components/planning'
import Image from 'next/image'
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

type Event = {
  id: number
  title: string
  start: Date
  end: Date
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const { t } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetch('/api/interventions')
      .then(res => res.json())
      .then((data: any[]) => {
        const parsed = data.map(evt => ({
          id: evt.id,
          title: evt.title,
          start: new Date(evt.start),
          end: new Date(evt.end),
        }))
        setEvents(parsed)
      })
      .catch(err => console.error('Erreur API interventions :', err))
  }, [])

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
                      className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
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
                      className="flex items-center rounded-md bg-green-50 px-4 py-3 text-white"
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

            <main className="min-h-screen bg-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold text-gray-800">{t("serviceProvider.calendar")}</h1>
                <Link href="/app_service-provider/calendar/availabilities">
                <p className="bg-green-50 text-white px-4 py-2 rounded hover:bg-green-600">
                {t("serviceProvider.myAvailabilities")}
                </p>
                </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <Planning events={events} />
            </div>
            </main>
        </div>        
    </div>
  )
}
