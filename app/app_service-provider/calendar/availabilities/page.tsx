"use client"

import { useState } from "react"
import { Calendar, momentLocalizer, type SlotInfo } from "react-big-calendar"
import moment from "moment"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"
import "react-big-calendar/lib/css/react-big-calendar.css"

// Assurez-vous que ce type est correctement défini
type Slot = {
  id: number
  title: string
  start: Date
  end: Date
}

export default function AvailabilitiesPage() {
  // Initialiser avec des créneaux valides
  const initialSlots: Slot[] = [
    {
      id: 1,
      title: "Disponible",
      start: new Date(),
      end: new Date(Date.now() + 3600 * 1000),
    },
    {
      id: 2,
      title: "Disponible",
      start: new Date(Date.now() + 2 * 3600 * 1000),
      end: new Date(Date.now() + 3 * 3600 * 1000),
    },
  ]

  const { t } = useLanguage()
  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState("Disponible")
  const [startValue, setStartValue] = useState("")
  const [endValue, setEndValue] = useState("")

  const localizer = momentLocalizer(moment)

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setTitle("Disponible")
    setStartValue(moment(slotInfo.start).format("YYYY-MM-DDTHH:mm"))
    setEndValue(moment(slotInfo.end).format("YYYY-MM-DDTHH:mm"))
    setSelectedSlot({
      id: Date.now(),
      title: "Disponible",
      start: new Date(slotInfo.start),
      end: new Date(slotInfo.end),
    })
    setShowModal(true)
  }

  const handleSelectEvent = (event: Slot) => {
    setSelectedSlot(event)
    setTitle(event.title)
    setStartValue(moment(event.start).format("YYYY-MM-DDTHH:mm"))
    setEndValue(moment(event.end).format("YYYY-MM-DDTHH:mm"))
    setShowModal(true)
  }

  const saveSlot = () => {
    if (!selectedSlot || !startValue || !endValue) return

    const updated: Slot = {
      ...selectedSlot,
      title: title || "Disponible", // Éviter les titres vides
      start: new Date(startValue),
      end: new Date(endValue),
    }

    setSlots((prev) => {
      const exists = prev.some((s) => s.id === updated.id)
      return exists ? prev.map((s) => (s.id === updated.id ? updated : s)) : [...prev, updated]
    })

    setShowModal(false)
    setSelectedSlot(null)
  }

  const deleteSlot = () => {
    if (!selectedSlot) return
    setSlots((prev) => prev.filter((s) => s.id !== selectedSlot.id))
    setShowModal(false)
    setSelectedSlot(null)
  }

  // Vérifiez que tous les événements ont une propriété 'title'
  const validSlots = slots.filter((slot) => slot && typeof slot === "object" && slot.title)

  return (
    <div className="min-h-screen bg-gray-50">

    <header className="bg-white p-4 flex justify-between items-center shadow-sm">
        <Link href="/app_service-provider" className="flex items-center">
          <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
        </Link>

        <div className="flex items-center mr-20">
          <LanguageSelector />
        </div>
    </header>
      
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-4">
        <Link href="/app_service-provider/calendar" className="text-green-500 hover:underline flex items-center">
            <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
            {t("navigation.backToCalendar")}
        </Link>
      </div>
      <div className="flex items-center mb-6 mt-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes disponibilités</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <Calendar     
          localizer={localizer}
          events={validSlots}
          defaultView="day"
          titleAccessor="title"
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          selectable
          views={["day"]}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          dayLayoutAlgorithm="no-overlap"
          className="text-sm"
        />
      </div>

      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {slots.some((s) => s.id === selectedSlot.id) ? "Modifier un créneau" : "Ajouter un créneau"}
            </h2>
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 mb-4 p-2 border rounded w-full"
            />
            <label className="block text-sm font-medium text-gray-700">Début</label>
            <input
              type="datetime-local"
              value={startValue}
              onChange={(e) => setStartValue(e.target.value)}
              className="mt-1 mb-4 p-2 border rounded w-full"
            />
            <label className="block text-sm font-medium text-gray-700">Fin</label>
            <input
              type="datetime-local"
              value={endValue}
              onChange={(e) => setEndValue(e.target.value)}
              className="mt-1 mb-4 p-2 border rounded w-full"
            />

            <div className="flex justify-end space-x-2">
              {slots.some((s) => s.id === selectedSlot.id) && (
                <button onClick={deleteSlot} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  Supprimer
                </button>
              )}
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedSlot(null)
                }}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
              <button onClick={saveSlot} className="bg-green-50 text-white px-4 py-2 rounded hover:bg-green-600">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
    </div>
  )
}