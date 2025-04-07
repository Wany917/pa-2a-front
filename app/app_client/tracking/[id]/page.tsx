import TrackingDetailClient from "@/components/tracking-detail-client"

export default function TrackingDetailPage({ params }: { params: { id: string } }) {
  return <TrackingDetailClient id={params.id} />
}

