"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  BarChart3,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Edit,
  CreditCard,
  ChevronRight,
  ArrowUp,
  BellRing,
  PartyPopper,
  CheckCircle,
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
import { useApiCall } from "@/hooks/use-api-call"
import { useLivreurWebSocket } from "@/hooks/use-livreur-websocket"
import { livreurService } from "@/services/livreurService"
import type { Livraison } from "@/types/api"

// ✅ NOUVEAU - Interface pour utilisateur multi-rôles (même structure que dans le service)
interface MultiRoleUser {
  id: number
  firstName: string
  lastName: string
  email: string
  livreur?: {
    id: number
    availabilityStatus: 'available' | 'busy' | 'offline'
    rating: string
    createdAt: string
    updatedAt: string
  }
  client?: any
  admin?: any
  prestataire?: any
  commercant?: any
}

interface RecentDelivery {
  id: string
  customer: string
  address: string
  status: string
  statusClass: string
  date: string
  rawDate: string
}

export default function DeliverymanDashboard() {
  const { t } = useLanguage()
  const [first_name, setUserName] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [user, setUser] = useState<MultiRoleUser | null>(null)
  const [recentDeliveries, setRecentDeliveries] = useState<RecentDelivery[]>([])
  const [stats, setStats] = useState([
    {
      title: t("deliveryman.totalDeliveries"),
      value: "0",
      change: "0%",
      changeType: "positive",
      icon: <Package className="h-6 w-6 text-indigo-500" />,
      bgColor: "bg-indigo-50",
    },
    {
      title: t("deliveryman.activeDeliveries"),
      value: "0",
      change: "0%",
      changeType: "positive",
      icon: <Package className="h-6 w-6 text-amber-500" />,
      bgColor: "bg-amber-50",
    },
    {
      title: t("deliveryman.completedDeliveries"),
      value: "0",
      change: "0%",
      changeType: "positive",
      icon: <Package className="h-6 w-6 text-rose-500" />,
      bgColor: "bg-rose-50",
    },
  ])

  const { execute: executeGetProfile, loading: profileLoading } = useApiCall<MultiRoleUser>()
  const { execute: executeGetLivraisons, loading: livraisonsLoading } = useApiCall<Livraison[]>()
  const { execute: executeGetStats, loading: statsLoading } = useApiCall<any>()

  const websocket = useLivreurWebSocket({
    userId: user?.livreur?.id || 0,
    onNewDeliveryAvailable: (data) => {
      console.log('Nouvelle livraison disponible:', data)
      if (user) {
        loadLivraisonsData()
      }
    },
    onDeliveryAcceptedSuccess: (data) => {
      console.log('Livraison acceptée avec succès:', data)
      if (user) {
        loadLivraisonsData()
      }
    },
    enableNotifications: true,
    enableLocationTracking: false,
  })

  const loadDashboardData = async () => {
    try {
      const userProfile = await executeGetProfile(livreurService.getProfile())
      console.log('Profil utilisateur récupéré:', userProfile)
      
      if (!userProfile?.id) {
        console.error('Utilisateur invalide - pas d\'ID:', userProfile)
        throw new Error('Profil utilisateur invalide')
      }
      
      if (!userProfile?.livreur?.id) {
        console.error('Utilisateur non-livreur:', userProfile)
        throw new Error('Accès non autorisé : rôle livreur requis')
      }
      
      setUser(userProfile)
      setUserName(userProfile.firstName || 'Livreur')

      await loadLivraisonsData()
      
    } catch (error) {
      console.error("Erreur lors du chargement du profil utilisateur:", error)
    }
  }

  const loadLivraisonsData = async () => {
    try {
      console.log('Tentative de chargement des livraisons...')
      const livraisonsResponse: any = await executeGetLivraisons(livreurService.getMyLivraisons())
      console.log('🟡 LIVRAISONS RÉPONSE COMPLÈTE:', JSON.stringify(livraisonsResponse, null, 2))
      
      // ✅ NOUVEAU - Extraire les livraisons de la structure de réponse correcte
      let livraisons: any[] = []
      
      // Tester différentes structures possibles
      if (Array.isArray(livraisonsResponse)) {
        console.log('✅ Structure: Array direct')
        livraisons = livraisonsResponse
      } else if (livraisonsResponse?.data && Array.isArray(livraisonsResponse.data)) {
        console.log('✅ Structure: response.data')
        livraisons = livraisonsResponse.data
      } else if (livraisonsResponse?.livraisons && Array.isArray(livraisonsResponse.livraisons)) {
        console.log('✅ Structure: response.livraisons (array)')
        livraisons = livraisonsResponse.livraisons
      } else if (livraisonsResponse?.livraisons?.data && Array.isArray(livraisonsResponse.livraisons.data)) {
        console.log('✅ Structure: response.livraisons.data')
        livraisons = livraisonsResponse.livraisons.data
      } else if (livraisonsResponse?.result && Array.isArray(livraisonsResponse.result)) {
        console.log('✅ Structure: response.result')
        livraisons = livraisonsResponse.result
      } else {
        console.warn('🔴 Structure de réponse livraisons inattendue:', livraisonsResponse)
        console.log('🔍 Type de livraisonsResponse:', typeof livraisonsResponse)
        console.log('🔍 Clés disponibles:', Object.keys(livraisonsResponse || {}))
        
        // Essayer de trouver un array dans les propriétés
        if (typeof livraisonsResponse === 'object' && livraisonsResponse !== null) {
          for (const [key, value] of Object.entries(livraisonsResponse)) {
            if (Array.isArray(value)) {
              console.log(`🟡 Trouvé un array dans la propriété "${key}":`, value)
              livraisons = value
              break
            }
          }
        }
        
        if (livraisons.length === 0) {
          livraisons = []
        }
      }
      
      console.log('🟡 Livraisons extraites:', livraisons, 'Length:', livraisons.length)
      
      if (livraisons.length > 0) {
        console.log('🟡 Première livraison exemple:', JSON.stringify(livraisons[0], null, 2))
      }
      
      const formattedDeliveries = livraisons.slice(0, 5).map((livraison: any) => {
        // Déterminer le statut et la classe CSS correspondante
        let statusClass = "bg-gray-100 text-gray-800"
        let statusKey = "pending"
        
        switch(livraison.status) {
          case "scheduled":
            statusClass = "bg-blue-100 text-blue-800"
            statusKey = "pending"
            break
          case "in_progress":
            statusClass = "bg-yellow-100 text-yellow-800"
            statusKey = "inTransit"
            break
          case "completed":
            statusClass = "bg-green-100 text-green-800"
            statusKey = "delivered"
            break
          case "cancelled":
            statusClass = "bg-red-100 text-red-800"
            statusKey = "cancelled"
            break
        }
        
        return {
          id: `#ECO-${livraison.id}`,
          customer: livraison.client ? `${livraison.client.first_name || livraison.client.firstName || ''} ${livraison.client.last_name || livraison.client.lastName || ''}`.trim() : "Client",
          address: livraison.dropoff_location || livraison.dropoffLocation || "Adresse non spécifiée",
          status: statusKey,
          statusClass: statusClass,
          date: formatDate(livraison.created_at || livraison.createdAt),
          rawDate: livraison.created_at || livraison.createdAt
        }
      })
      
      formattedDeliveries.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
      setRecentDeliveries(formattedDeliveries)
      
      console.log('Calcul des statistiques à partir des données livraisons...')
      
      setStats([
        {
          title: t("deliveryman.totalDeliveries"),
          value: livraisons.length.toString(),
          change: "+0%",
          changeType: "positive",
          icon: <Package className="h-6 w-6 text-indigo-500" />,
          bgColor: "bg-indigo-50",
        },
        {
          title: t("deliveryman.activeDeliveries"),
          value: livraisons.filter(l => l.status === "in_progress" || l.status === "scheduled").length.toString(),
          change: "+0%",
          changeType: "positive",
          icon: <Clock className="h-6 w-6 text-amber-500" />,
          bgColor: "bg-amber-50",
        },
        {
          title: t("deliveryman.completedDeliveries"),
          value: livraisons.filter(l => l.status === "completed").length.toString(),
          change: "+0%",
          changeType: "positive",
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          bgColor: "bg-green-50",
        },
      ])
      
    } catch (error) {
      console.error("🔴 Erreur lors du chargement des livraisons:", error)
      
      // ✅ NOUVEAU - Fallback: au moins afficher des stats de base
      setStats([
        {
          title: t("deliveryman.totalDeliveries"),
          value: "0",
          change: "+0%",
          changeType: "positive",
          icon: <Package className="h-6 w-6 text-indigo-500" />,
          bgColor: "bg-indigo-50",
        },
        {
          title: t("deliveryman.activeDeliveries"),
          value: "0",
          change: "+0%",
          changeType: "positive",
          icon: <Clock className="h-6 w-6 text-amber-500" />,
          bgColor: "bg-amber-50",
        },
        {
          title: t("deliveryman.completedDeliveries"),
          value: "0",
          change: "+0%",
          changeType: "positive",
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          bgColor: "bg-green-50",
        },
      ])
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (user?.livreur?.id && !websocket.isConnected) {
      console.log('Utilisateur livreur chargé, tentative de connexion WebSocket...')
    }
  }, [user?.livreur?.id, websocket.isConnected])

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date non spécifiée"
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Date invalide"
      }
      
      return date.toLocaleDateString()
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error)
      return "Date non spécifiée"
    }
  }

  const loading = profileLoading || livraisonsLoading || statsLoading

  return (
    <div className="flex h-screen bg-gray-50">
      {process.env.NODE_ENV === 'development' && (
        <div className={`fixed top-4 right-4 px-2 py-1 rounded text-xs z-50 ${
          websocket.isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          WS: {websocket.isConnected ? 'Connected' : 'Disconnected'}
        </div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/app_deliveryman" className="flex items-center">
              <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/app_deliveryman"
                  className="flex items-center rounded-md bg-green-50 px-4 py-3 text-white"
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  <span>{t("deliveryman.dashboard")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_deliveryman/announcements"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <PartyPopper className="mr-3 h-5 w-5" />
                  <span>{t("deliveryman.announcements")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_deliveryman/deliveries"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <Package className="mr-3 h-5 w-5" />
                  <span>{t("deliveryman.deliveries")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_deliveryman/notifications"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <BellRing className="mr-3 h-5 w-5" />
                  <span>{t("deliveryman.notifications")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_deliveryman/messages"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <MessageSquare className="mr-3 h-5 w-5" />
                  <span>{t("deliveryman.messages")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_deliveryman/payments"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <CreditCard className="mr-3 h-5 w-5" />
                  <span>{t("deliveryman.payments")}</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <div className="flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="ml-auto flex items-center space-x-4">
            <LanguageSelector />

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors"
              >
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">{first_name}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100">
                  <Link
                    href="/app_deliveryman/edit-account"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span>{t("common.editAccount")}</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <Link href="/app_client" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <User className="h-4 w-4 mr-2" />
                    <span>{t("common.clientSpace")}</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <div className="px-4 py-1 text-xs text-gray-500">{t("common.accessToSpace")}</div>

                  <Link href="/register/shopkeeper" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.shopkeeper")}
                  </Link>

                  <Link href="/register/service-provider" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.serviceProvider")}
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

        <main className="p-4 lg:p-6">
          <h1 className="mb-6 text-2xl font-bold">{t("deliveryman.dashboard")}</h1>

          {loading && (
            <div className="mb-6 text-center">
              <div className="text-gray-500">{t("common.loading")}</div>
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={index} className="overflow-hidden rounded-lg bg-white shadow">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bgColor}`}>
                        {stat.icon}
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <span
                      className={`inline-flex items-center ${
                        stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      <ArrowUp
                        className={`mr-1.5 h-4 w-4 flex-shrink-0 ${
                          stat.changeType === "positive" ? "text-green-500" : "text-red-500 transform rotate-180"
                        }`}
                      />
                      <span className="font-medium">{stat.change}</span>
                      <span className="ml-1">{t("deliveryman.fromYesterday")}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="flex items-center justify-between p-6">
              <h2 className="text-lg font-medium text-gray-900">{t("deliveryman.recentDeliveries")}</h2>
              <Link
                href="/app_deliveryman/deliveries"
                className="flex items-center text-sm font-medium text-green-600 hover:text-green-500"
              >
                <span>{t("deliveryman.viewAll")}</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="divide-y divide-gray-200">
              {recentDeliveries.length > 0 ? (
                recentDeliveries.map((delivery, index) => (
                  <div key={index} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{delivery.id}</div>
                          <div className="text-sm text-gray-500">{delivery.customer}</div>
                          <div className="text-sm text-gray-500">{delivery.address}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${delivery.statusClass}`}>
                          {t(`deliveryman.${delivery.status}`)}
                        </span>
                        <div className="ml-4 text-sm text-gray-500">{delivery.date}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  {loading ? t("common.loading") : t("deliveryman.noRecentDeliveries")}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function User(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  )
}