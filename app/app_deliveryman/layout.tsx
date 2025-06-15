"use client"

import { AuthProvider } from '../auth-context'

export default function DeliverymanAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}