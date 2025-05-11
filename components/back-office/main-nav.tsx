"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ShoppingCart, Users, Settings, BarChart3 } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Tableau de bord",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      href: "/produits",
      label: "Produits",
      icon: ShoppingCart,
      active: pathname === "/produits",
    },
    {
      href: "/utilisateurs",
      label: "Utilisateurs",
      icon: Users,
      active: pathname === "/utilisateurs",
    },
    {
      href: "/statistiques",
      label: "Statistiques",
      icon: BarChart3,
      active: pathname === "/statistiques",
    },
    {
      href: "/parametres",
      label: "Paramètres",
      icon: Settings,
      active: pathname === "/parametres",
    },
  ]

  return (
    <nav className="flex items-center space-x-6 lg:space-x-8">
      <Link href="/" className="hidden items-center space-x-2 md:flex">
        <span className="hidden font-bold sm:inline-block">Admin Panel</span>
      </Link>
      <div className="flex items-center space-x-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
              route.active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <route.icon className="mr-2 h-4 w-4" />
            {route.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

