'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/language-context';
import DeliverymanLayout from '@/components/deliveryman/layout';
import { BarChart3, Package, ChevronRight, ArrowUp } from 'lucide-react';
import Link from 'next/link';

// Composant d'icône d'utilisateur
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

// Composant d'icône d'horloge
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
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export default function DeliverymanDashboardPage() {
  const { t } = useLanguage()
  
  // Données pour les cartes statistiques
  const stats = [
    {
      title: t("deliveryman.totalClients"),
      value: "40,689",
      change: "+8.5%",
      changeType: "positive",
      icon: <UserIcon className="h-6 w-6 text-indigo-500" />,
      bgColor: "bg-indigo-50",
    },
    {
      title: t("deliveryman.deliveriesThisWeek"),
      value: "10,293",
      change: "+1.3%",
      changeType: "positive",
      icon: <Package className="h-6 w-6 text-amber-500" />,
      bgColor: "bg-amber-50",
    },
    {
      title: t("deliveryman.totalPendingDeliveries"),
      value: "200",
      change: "+1.8%",
      changeType: "positive",
      icon: <Clock className="h-6 w-6 text-rose-500" />,
      bgColor: "bg-rose-50",
    },
  ]

  return (
    <DeliverymanLayout>
      <h1 className="mb-6 text-2xl font-bold">{t("deliveryman.dashboard")}</h1>

      {/* Stats cards */}
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

      {/* Recent deliveries section */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="flex items-center justify-between p-6">
          <h2 className="text-lg font-medium text-gray-900">{t("deliveryman.recentDeliveries")}</h2>
          <Link
            href="/app_deliveryman/deliveries"
            className="flex items-center text-sm font-medium text-green-600 hover:text-green-500"
          >
            {t("deliveryman.viewAll")}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("deliveryman.orderId")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("deliveryman.customer")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("deliveryman.address")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("deliveryman.status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("deliveryman.date")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {[
                  {
                    id: "#ECO-12345",
                    customer: "John Doe",
                    address: "123 Main St, Paris",
                    status: "delivered",
                    statusClass: "bg-green-100 text-green-800",
                    date: "2025-04-01",
                  },
                  {
                    id: "#ECO-23456",
                    customer: "Jane Smith",
                    address: "456 Oak Ave, Lyon",
                    status: "inTransit",
                    statusClass: "bg-yellow-100 text-yellow-800",
                    date: "2025-04-02",
                  },
                  {
                    id: "#ECO-34567",
                    customer: "Robert Johnson",
                    address: "789 Pine Rd, Marseille",
                    status: "pending",
                    statusClass: "bg-blue-100 text-blue-800",
                    date: "2025-04-03",
                  },
                  {
                    id: "#ECO-45678",
                    customer: "Emily Davis",
                    address: "321 Cedar Ln, Bordeaux",
                    status: "delivered",
                    statusClass: "bg-green-100 text-green-800",
                    date: "2025-04-04",
                  },
                  {
                    id: "#ECO-56789",
                    customer: "Michael Brown",
                    address: "654 Elm Blvd, Nice",
                    status: "inTransit",
                    statusClass: "bg-yellow-100 text-yellow-800",
                    date: "2025-04-05",
                  },
                ].map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{item.id}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.customer}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.address}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${item.statusClass}`}
                      >
                        {t(`deliveryman.deliveriess.${item.status}`)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DeliverymanLayout>
  )
}