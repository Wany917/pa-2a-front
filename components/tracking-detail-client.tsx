"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Calendar, Download, AlertCircle } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import { formatDate, formatTime } from '@/app/utils/date-formats'

// Types pour les données de suivi
interface TrackingEvent {
  date: string
  time: string
  location: string
  status: string
  description: string
}

interface TrackingData {
  id: string
  status: "pending" | "in-transit" | "delivered" | "exception"
  packageName: string
  sender: string
  recipient: string
  origin: string
  destination: string
  estimatedDelivery: string
  shippedDate: string
  events: TrackingEvent[]
}

export default function TrackingDetailClient({ id }: { id: string }) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPackageDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/colis/${id}/tracking`);
        
        if (!response.ok) {
          setError(t("tracking.errorFetchingPackage"));
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        if (!data.colis) {
          setError(t("tracking.packageNotFound"));
          setLoading(false);
          return;
        }
        
        const { colis, locationHistory } = data;
        
        // Convertir les données API en format attendu par le composant
        const trackingData: TrackingData = {
          id: colis.trackingNumber || id,
          status: getPackageStatus(colis.status),
          packageName: colis.contentDescription || "Package",
          sender: colis.annonce?.utilisateur?.firstName || "Unknown",
          recipient: "Client",
          origin: colis.annonce?.starting_address || "Unknown",
          destination: colis.annonce?.destination_address || colis.currentAddress || "Unknown",
          estimatedDelivery: formatDate(colis.estimatedDeliveryDate),
          shippedDate: formatDate(colis.createdAt),
          events: []
        };
        
        // Traiter l'historique des locations
        if (locationHistory && Array.isArray(locationHistory) && locationHistory.length > 0) {
          trackingData.events = locationHistory.map((event: any) => ({
            date: formatDate(event.movedAt || event.createdAt),
            time: formatTime(event.movedAt || event.createdAt),
            location: event.address || "Unknown",
            status: mapLocationType(event.locationType),
            description: event.description || "Status update"
          }));
        } else {
          // Si pas d'historique, ajouter un événement initial
          trackingData.events = [{
            date: formatDate(colis.createdAt),
            time: formatTime(colis.createdAt),
            location: "System",
            status: "pending",
            description: "Package registered"
          }];
        }
        
        setTrackingData(trackingData);
      } catch (error) {
        console.error("Error fetching package details:", error);
        setError(t("tracking.errorFetchingPackage"));
      } finally {
        setLoading(false);
      }
    };
    
    fetchPackageDetails();
  }, [id, t]);

  // Convertir le statut du colis en format de l'interface
  const getPackageStatus = (status: string): "pending" | "in-transit" | "delivered" | "exception" => {
    switch (status) {
      case "delivered":
        return "delivered";
      case "in_transit":
        return "in-transit";
      case "stored":
        return "pending";
      default:
        return "pending";
    }
  };
  
  // Convertir les types de localisation en format d'affichage
  const mapLocationType = (locationType: string): string => {
    switch (locationType) {
      case "client_address":
        return "client-address";
      case "warehouse":
        return "warehouse";
      case "in_transit":
        return "in-transit";
      case "storage_box":
        return "storage-box";
      default:
        return locationType || "unknown";
    }
  };

  // Fonction pour obtenir la couleur et l'icône en fonction du statut
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
      case "client-address":
      case "warehouse":
      case "storage-box":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: <Package className="h-5 w-5 text-yellow-600" />,
          text: t("tracking.pending"),
        }
      case "in-transit":
        return {
          color: "bg-blue-100 text-blue-800",
          icon: <Truck className="h-5 w-5 text-blue-600" />,
          text: t("tracking.inTransit"),
        }
      case "delivered":
        return {
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          text: t("tracking.delivered"),
        }
      case "exception":
        return {
          color: "bg-red-100 text-red-800",
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          text: t("tracking.exception"),
        }
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: <Package className="h-5 w-5 text-gray-600" />,
          text: status,
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Link href="/app_client/tracking" className="flex items-center text-gray-600 hover:text-green-500">
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t("tracking.backToTracking")}
            </Link>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("tracking.packageNotFound")}</h2>
              <p className="text-gray-600">{error || t("tracking.noInformationAvailable")}</p>
              <Link 
                href="/app_client/tracking" 
                className="mt-6 inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                {t("tracking.tryAnother")}
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const statusInfo = getStatusInfo(trackingData.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/app_client/tracking" className="flex items-center text-gray-600 hover:text-green-500">
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t("tracking.backToTracking")}
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* En-tête du suivi */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 mb-1">{trackingData.packageName}</h1>
                <p className="text-gray-500">{t("tracking.trackingNumber")}: {trackingData.id}</p>
              </div>
              <div className={`${statusInfo.color} px-3 py-1 rounded-full flex items-center mt-2 sm:mt-0`}>
                {statusInfo.icon}
                <span className="ml-1 text-sm font-medium">{statusInfo.text}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">{t("tracking.from")}</h2>
                <p className="text-gray-800">{trackingData.origin}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">{t("tracking.to")}</h2>
                <p className="text-gray-800">{trackingData.destination}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">{t("tracking.estimatedDelivery")}</h2>
                <p className="text-gray-800">{trackingData.estimatedDelivery}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">{t("tracking.shipped")}</h2>
                <p className="text-gray-800">{trackingData.shippedDate}</p>
              </div>
            </div>
          </div>

          {/* Historique de suivi */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">{t("tracking.deliveryHistory")}</h2>
            </div>

            <div className="divide-y divide-gray-100">
              {trackingData.events.map((event, index) => {
                const eventStatusInfo = getStatusInfo(event.status)
                return (
                  <div key={index} className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="mt-1 mr-4">{eventStatusInfo.icon}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">{event.status === "in-transit" ? t("tracking.inTransit") : event.status}</h3>
                            <p className="text-gray-600 text-sm">{event.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-800">{event.date}</p>
                            <p className="text-xs text-gray-500">{event.time}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 inline-block mr-1 text-gray-400" />
                          {event.location}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link 
              href={`/app_client/tracking/email-template?id=${trackingData.id}`}
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              {t("tracking.receiveByEmail")}
            </Link>
            
            <Link 
              href="/app_client/complaint/create"
              className="border border-green-500 text-green-500 px-4 py-2 rounded-lg flex items-center justify-center hover:bg-green-50 transition-colors"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              {t("tracking.reportProblem")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

