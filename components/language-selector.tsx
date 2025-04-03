"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "./language-context"

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage } = useLanguage()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const selectLanguage = (lang: "FR" | "EN" | "ES") => {
    setLanguage(lang)
    setIsOpen(false)
  }

  // Fermer le menu déroulant lorsqu'on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-1 text-sm font-medium hover:text-green-500 transition-colors bg-gray-100 px-3 py-1.5 rounded-md"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="font-semibold">{language}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 sm:right-auto mt-2 w-24 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <button
            onClick={() => selectLanguage("FR")}
            className={`block w-full text-left px-4 py-2 text-sm ${language === "FR" ? "bg-green-50 text-white" : "text-gray-700 hover:bg-gray-100"}`}
          >
            FR
          </button>
          <button
            onClick={() => selectLanguage("EN")}
            className={`block w-full text-left px-4 py-2 text-sm ${language === "EN" ? "bg-green-50 text-white" : "text-gray-700 hover:bg-gray-100"}`}
          >
            EN
          </button>
          <button
            onClick={() => selectLanguage("ES")}
            className={`block w-full text-left px-4 py-2 text-sm ${language === "ES" ? "bg-green-50 text-white" : "text-gray-700 hover:bg-gray-100"}`}
          >
            ES
          </button>
        </div>
      )}
    </div>
  )
}

