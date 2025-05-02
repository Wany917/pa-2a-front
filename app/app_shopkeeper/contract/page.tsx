import type { Metadata } from "next"
import ShopkeeperContractsClient from "@/components/shopkeeper/contract"

export const metadata: Metadata = {
  title: "EcoDeli - Shopkeeper Contracts",
  description: "Choose the right plan for your business",
}

export default function ShopkeeperContractsPage() {
  return <ShopkeeperContractsClient />
}