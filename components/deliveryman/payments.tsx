"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
import Link from "next/link"
import { useApiCall } from "@/hooks/use-api-call"
import { livreurService } from "@/services/livreurService"
import {
  BarChart3,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Edit,
  BellRing,
  CreditCard,
  User,
  X,
  Download,
  Search,
  PartyPopper,
  Filter,
} from "lucide-react"

interface MultiRoleUser {
  id: number
  firstName: string
  lastName: string
  email: string
  livreur?: {
    id: number
    vehicle_type?: string
    availability_status: string
  }
}

interface Payment {
  id: string
  orderName: string
  client: string
  date: string
  amount: number
  status: "completed" | "pending"
  description?: string
  reference?: string
}

export default function PaymentsDeliveryman() {
  const { t } = useLanguage()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">("all")
  const [first_name, setUserName] = useState("")

  // Hooks API modernes
  const { execute: executeGetProfile, loading: profileLoading } = useApiCall<MultiRoleUser>()
  const { execute: executeGetPayments, loading: paymentsLoading } = useApiCall<any>()

  // Charger les données utilisateur
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const userProfile = await executeGetProfile(
        livreurService.getProfile().then(res => res.data)
      )
      if (userProfile) {
        setUserName(userProfile.firstName)
        await loadPayments()
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      alert('Erreur de connexion lors du chargement du profil utilisateur')
    }
  }

  const loadPayments = async () => {
    try {
      // ✅ CORRIGÉ - Utiliser les livraisons comme données de paiement
      const paymentsResponse = await executeGetPayments(
        livreurService.getMyLivraisons()
      )
      
      if (paymentsResponse?.livraisons || paymentsResponse?.data) {
        const livraisons = paymentsResponse.livraisons || paymentsResponse.data || paymentsResponse
        
        // Convertir les livraisons en paiements
        const formattedPayments: Payment[] = livraisons.map((livraison: any, index: number) => ({
          id: livraison.id?.toString() || `payment-${index}`,
          orderName: livraison.description || `Livraison #${livraison.id || index}`,
          client: livraison.client_name || livraison.clientName || 'Client inconnu',
          date: livraison.created_at || livraison.date || new Date().toISOString(),
          amount: parseFloat(livraison.price || livraison.amount || '0'),
          status: livraison.status === 'delivered' ? 'completed' : 'pending',
          description: livraison.description || '',
          reference: livraison.reference || livraison.id?.toString() || ''
        }))
        
        setPayments(formattedPayments)
      } else {
        console.warn('Aucune donnée de paiement trouvée')
        setPayments([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error)
      alert('Erreur de connexion lors du chargement des paiements')
      setPayments([])
    }
  }

  // ✅ SUPPRIMÉ - Plus de données mock

  // ✅ NOUVEAU - Utiliser les données réelles des paiements
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.reference?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Calculer les totaux à partir des données réelles
  const totalPaid = payments
    .filter(payment => payment.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0)

  const totalPending = payments
    .filter(payment => payment.status === "pending")
    .reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("deliveryman.payments")}</h1>

      {/* Statistiques de paiement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-sm text-gray-500 mb-2">{t("payments.totalReceived")}</h2>
          <p className="text-3xl font-bold text-green-500">£{totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-sm text-gray-500 mb-2">{t("payments.pendingPayments")}</h2>
          <p className="text-3xl font-bold text-amber-500">£{totalPending.toFixed(2)}</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("payments.searchPayments")}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none w-full sm:w-40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">{t("common.all")}</option>
              <option value="paid">{t("payments.paid")}</option>
              <option value="pending">{t("payments.pending")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des paiements */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("payments.invoiceId")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("payments.orderName")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("payments.client")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("payments.date")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("payments.amount")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("payments.status")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("payments.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.orderName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {payment.status === "paid" ? t("payments.paid") : t("payments.pending")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-green-600 hover:text-green-900 inline-flex items-center"
                      onClick={() => console.log(`Download invoice for ${payment.id}`)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {t("payments.invoice")}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                  {t("payments.noPaymentsFound")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
