import ServiceDetailClient from "@/components/service-detail-client"

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  return <ServiceDetailClient id={params.id} />
}

