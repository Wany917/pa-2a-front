import type { Metadata } from "next"
import NotificationsClient from "@/components/deliveryman/notifications"
import DeliverymanLayout from "@/components/deliveryman/layout"

export const metadata: Metadata = {
  title: "Notifications | EcoDeli",
  description: "View and manage your delivery notifications",
}

export default function NotificationsPage() {
  return (
    <DeliverymanLayout>
      <NotificationsClient />
    </DeliverymanLayout>
  )
}