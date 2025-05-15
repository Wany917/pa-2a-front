"use client"

import DeliveryDetailClient from "@/components/deliveryman/delivery-detail"

export default function DeliveryDetailPage({ params }: { params: { id: string } }) {
  return <DeliveryDetailClient id={params.id} />
}