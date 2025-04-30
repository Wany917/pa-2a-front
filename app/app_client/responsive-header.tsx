"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { User, Menu, X, LogOut, Edit, ChevronDown } from "lucide-react"
import LanguageSelector from "@/components/language-selector"
import { useScreenSize, MobileOnly, TabletUp } from "../utils/responsive-utils"
import { useLanguage } from "@/components/language-context"

interface HeaderProps {
  activePage?: "announcements" | "payments" | "messages" | "complaint"
}

export default function ResponsiveHeader({ activePage }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [first_name, setUserName] = useState("")
  const { isMobile } = useScreenSize()
  const { t } = useLanguage()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  useEffect(() => {
		const token =
			sessionStorage.getItem('authToken') ||
			localStorage.getItem('authToken');
		if (!token) return;

		fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			credentials: 'include',
		})
			.then((res) => {
				if (!res.ok) throw new Error('Unauthorized');
				return res.json();
			})
			.then((data) => {
				setUserName(data.firstName);
			})
			.catch((err) => console.error('Auth/me failed:', err));
	}, []);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/app_client">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-NEF7Y3VVan4gaPKz0Ke4Q9FTKCgie4.png"
              alt="EcoDeli Logo"
              width={120}
              height={40}
              className="h-auto"
            />
          </Link>
        </div>

        {/* Menu burger pour mobile */}
        <MobileOnly>
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-600 hover:text-green-500"
            aria-label={isMenuOpen ? t("common.close") : t("common.open")}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </MobileOnly>

        {/* Navigation desktop */}
        <TabletUp>
          <nav className="flex items-center space-x-6">
            <Link
              href="/app_client/announcements"
              className={`${activePage === "announcements" ? "text-green-500 font-medium border-b-2 border-green-500" : "text-gray-700 hover:text-green-500"}`}
            >
              {t("navigation.myAnnouncements")}
            </Link>
            <Link
              href="/app_client/payments"
              className={`${activePage === "payments" ? "text-green-500 font-medium border-b-2 border-green-500" : "text-gray-700 hover:text-green-500"}`}
            >
              {t("navigation.myPayments")}
            </Link>
            <Link
              href="/app_client/messages"
              className={`${activePage === "messages" ? "text-green-500 font-medium border-b-2 border-green-500" : "text-gray-700 hover:text-green-500"}`}
            >
              {t("navigation.messages")}
            </Link>
            <Link
              href="/app_client/complaint"
              className={`${activePage === "complaint" ? "text-green-500 font-medium border-b-2 border-green-500" : "text-gray-700 hover:text-green-500"}`}
            >
              {t("navigation.makeComplaint")}
            </Link>
          </nav>
        </TabletUp>

        <div className="flex items-center space-x-4">
          <LanguageSelector />

          {/* User Account Menu */}
          <div className="relative">
            <button
              className="flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors"
              onClick={toggleUserMenu}
            >
              <User className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">{first_name}</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-20 py-2 border border-gray-100">
                <Link
                  href="/app_client/edit-account"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  <span>{t("common.editAccount")}</span>
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <div className="px-4 py-1 text-xs text-gray-500">{t("common.registerAs")}</div>

                <Link
                  href="/register/delivery-man"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  {t("common.deliveryMan")}
                </Link>

                <Link
                  href="/register/shopkeeper"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  {t("common.shopkeeper")}
                </Link>

                <Link
                  href="/register/service-provider"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  {t("common.serviceProvider")}
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <Link
                  href="/logout"
                  className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>{t("common.logout")}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {isMobile && isMenuOpen && (
        <nav className="bg-white py-4 px-6 shadow-inner">
          <ul className="space-y-4">
            <li>
              <Link
                href="/app_client/announcements"
                className={`block py-2 ${activePage === "announcements" ? "text-green-500 font-medium" : "text-gray-700"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("navigation.myAnnouncements")}
              </Link>
            </li>
            <li>
              <Link
                href="/app_client/payments"
                className={`block py-2 ${activePage === "payments" ? "text-green-500 font-medium" : "text-gray-700"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("navigation.myPayments")}
              </Link>
            </li>
            <li>
              <Link
                href="/app_client/messages"
                className={`block py-2 ${activePage === "messages" ? "text-green-500 font-medium" : "text-gray-700"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("navigation.messages")}
              </Link>
            </li>
            <li>
              <Link
                href="/app_client/complaint"
                className={`block py-2 ${activePage === "complaint" ? "text-green-500 font-medium" : "text-gray-700"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("navigation.makeComplaint")}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}

