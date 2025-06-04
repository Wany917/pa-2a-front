import TrackingDetailClient from "@/components/tracking-detail-client"

export default async function TrackingColisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TrackingDetailClient id={id} />
} 