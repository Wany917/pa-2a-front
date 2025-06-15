"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  userRole: "client" | "admin" | "shopkeeper" | "service_provider" | "delivery_man" | "guest"
  userData: any | null
  login: (role?: "client" | "admin" | "shopkeeper" | "service_provider" | "delivery_man") => void
  logout: () => void
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<"client" | "admin" | "shopkeeper" | "service_provider" | "delivery_man" | "guest">("guest")
  const [userData, setUserData] = useState<any | null>(null)

  // Fonction pour déterminer le rôle utilisateur basé sur les données du backend
  const determineUserRole = (userData: any): "client" | "admin" | "shopkeeper" | "service_provider" | "delivery_man" | "guest" => {
    if (!userData) return "guest"
    
    // Priorité 1: Champ role direct
    if (userData.role) {
      const roleMapping: Record<string, string> = {
        'admin': 'admin',
        'client': 'client', 
        'shopkeeper': 'shopkeeper',
        'service_provider': 'service_provider',
        'delivery_man': 'delivery_man',
        'livreur': 'delivery_man' // Mapping backend
      }
      if (roleMapping[userData.role]) {
        return roleMapping[userData.role] as any
      }
    }
    
    // Priorité 2: Objets présents
    if (userData.admin) return 'admin'
    if (userData.livreur) return 'delivery_man'
    if (userData.prestataire) return 'service_provider'
    if (userData.commercant) return 'shopkeeper'
    if (userData.client) return 'client'
    
    return 'guest'
  }

  // Fonction pour récupérer les données utilisateur depuis l'API
  const refreshUserData = async (): Promise<void> => {
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
      if (!token) {
        setIsAuthenticated(false)
        setUserRole('guest')
        setUserData(null)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      setUserData(data)
      const role = determineUserRole(data)
      setUserRole(role)
      setIsAuthenticated(true)
      
      // Sauvegarder le rôle dans localStorage pour la persistance
      localStorage.setItem('userRole', role)
      
    } catch (error) {
      console.error('Error fetching user data:', error)
      setIsAuthenticated(false)
      setUserRole('guest')
      setUserData(null)
      localStorage.removeItem('userRole')
    }
  }

  useEffect(() => {
    // Au chargement, vérifier s'il y a un token et récupérer les données utilisateur
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
    if (token) {
      refreshUserData()
    } else {
      // Fallback: lire depuis localStorage si pas de token
      const stored = localStorage.getItem("userRole")
      const validRoles = ["client", "admin", "shopkeeper", "service_provider", "delivery_man"]
      if (stored && validRoles.includes(stored)) {
        setIsAuthenticated(true)
        setUserRole(stored as "client" | "admin" | "shopkeeper" | "service_provider" | "delivery_man")
      }
    }
  }, [])

  const login = (role: "client" | "admin" | "shopkeeper" | "service_provider" | "delivery_man" = "client") => {
    setIsAuthenticated(true)
    setUserRole(role)
    localStorage.setItem("userRole", role)
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUserRole("guest")
    setUserData(null)
    localStorage.removeItem("userRole")
    sessionStorage.removeItem('authToken')
    localStorage.removeItem('authToken')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userData, login, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}