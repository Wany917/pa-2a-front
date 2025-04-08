import type { Metadata } from "next"
import NotificationsClient from "@/components/deliveryman/notifications"

export const metadata: Metadata = {
  title: "Notifications | EcoDeli",
  description: "View and manage your delivery notifications",
}

export default function NotificationsPage() {
  return <NotificationsClient />
}