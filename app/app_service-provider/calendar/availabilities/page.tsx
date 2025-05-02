"use client"

import { useState } from "react"
import { Calendar, momentLocalizer, type SlotInfo, Views } from "react-big-calendar"
import moment from "moment"
import Link from "next/link"
import { ChevronDown, ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"
import "react-big-calendar/lib/css/react-big-calendar.css"
import "./calendar-style.css"

export type Slot = {
  id: number
  title: string
  start: Date
  end: Date
}

export default function AvailabilitiesPage() {
  const { t } = useLanguage()
  const [view, setView] = useState<Views>(Views.WEEK)
  const [date, setDate] = useState<Date>(new Date())

  const initialSlots: Slot[] = [
    { id: 1, title: t("serviceProvider.available"), start: new Date(), end: new Date(Date.now() + 3600 * 1000) },
    {
      id: 2,
      title: t("serviceProvider.available"),
      start: new Date(Date.now() + 2 * 3600 * 1000),
      end: new Date(Date.now() + 3 * 3600 * 1000),
    },
  ]

  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState("")
  const [startValue, setStartValue] = useState("")
  const [endValue, setEndValue] = useState("")

  const localizer = momentLocalizer(moment)

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setTitle(t("serviceProvider.available"))
    setStartValue(moment(slotInfo.start).format("YYYY-MM-DDTHH:mm"))
    setEndValue(moment(slotInfo.end).format("YYYY-MM-DDTHH:mm"))
    setSelectedSlot({
      id: Date.now(),
      title: t("serviceProvider.available"),
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
      title: title || t("serviceProvider.available"),
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

  const eventPropGetter = (event: Slot) => ({
    style: {
      backgroundColor: "#8CD790",
      border: "2px solid #7ac57e",
      color: "white",
      borderRadius: "4px",
      padding: "2px 4px",
      fontWeight: 500,
    },
  })

  // Composant personnalisé pour la barre d'outils
  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate("TODAY")}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {t("calendar.today")}
          </button>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => onNavigate("PREV")}
              className="p-1 rounded-full text-gray-600 hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold px-2">{label}</h2>
            <button
              type="button"
              onClick={() => onNavigate("NEXT")}
              className="p-1 rounded-full text-gray-600 hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onView("day")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              view === "day"
                ? "bg-[#8CD790] text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t("calendar.day")}
          </button>
          <button
            type="button"
            onClick={() => onView("week")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              view === "week"
                ? "bg-[#8CD790] text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t("calendar.week")}
          </button>
          <button
            type="button"
            onClick={() => onView("month")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              view === "month"
                ? "bg-[#8CD790] text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t("calendar.month")}
          </button>
        </div>
      </div>
    )
  }

  // S'assurer que tous les événements ont une propriété 'title'
  const validSlots = slots.filter((s) => s && typeof s === "object" && s.title)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white p-4 flex justify-between items-center shadow-sm">
        <Link href="/app_service-provider" className="flex items-center">
          <div className="flex flex-col">
            <span className="text-[#8CD790] text-2xl font-bold">EcoDeli</span>
            <span className="text-gray-400 text-sm">Daily Delivery</span>
          </div>
        </Link>
        <div className="flex items-center mr-20">
          <LanguageSelector />
        </div>
      </header>

      <main className="p-8">
        <div className="flex items-center justify-between mb-4">
          <Link href="/app_service-provider/calendar" className="text-[#8CD790] hover:underline flex items-center">
            <ChevronDown className="h-4 w-4 mr-1 rotate-90" /> {t("navigation.backToCalendar")}
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("serviceProvider.myAvailabilities")}</h1>

        <div className="bg-white shadow-md rounded-lg p-6 calendar-container">
          <Calendar
            localizer={localizer}
            events={validSlots}
            view={view}
            date={date}
            onView={setView as any}
            onNavigate={setDate}
            views={[Views.DAY, Views.WEEK, Views.MONTH]}
            defaultView={Views.WEEK}
            messages={{
              day: t("calendar.day"),
              week: t("calendar.week"),
              month: t("calendar.month"),
              today: t("calendar.today"),
              previous: t("calendar.previous"),
              next: t("calendar.next"),
            }}
            titleAccessor="title"
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventPropGetter}
            dayLayoutAlgorithm="no-overlap"
            className="text-sm"
            components={{
              toolbar: CustomToolbar,
            }}
          />
        </div>

        {showModal && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-[#8CD790]" />
                {slots.some((s) => s.id === selectedSlot.id)
                  ? t("serviceProvider.editSlot")
                  : t("serviceProvider.addSlot")}
              </h2>
              <label className="block text-sm font-medium text-gray-700">{t("serviceProvider.title")}</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 mb-4 p-2 border rounded-md w-full focus:ring-[#8CD790] focus:border-[#8CD790]"
              />
              <label className="block text-sm font-medium text-gray-700">{t("serviceProvider.start")}</label>
              <input
                type="datetime-local"
                value={startValue}
                onChange={(e) => setStartValue(e.target.value)}
                className="mt-1 mb-4 p-2 border rounded-md w-full focus:ring-[#8CD790] focus:border-[#8CD790]"
              />
              <label className="block text-sm font-medium text-gray-700">{t("common.end")}</label>
              <input
                type="datetime-local"
                value={endValue}
                onChange={(e) => setEndValue(e.target.value)}
                className="mt-1 mb-4 p-2 border rounded-md w-full focus:ring-[#8CD790] focus:border-[#8CD790]"
              />

              <div className="flex justify-end space-x-2 mt-6">
                {slots.some((s) => s.id === selectedSlot.id) && (
                  <button
                    onClick={deleteSlot}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                  >
                    {t("common.delete")}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedSlot(null)
                  }}
                  className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={saveSlot}
                  className="bg-[#8CD790] text-white px-4 py-2 rounded-md hover:bg-[#7ac57e] transition-colors"
                >
                  {t("common.save")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}