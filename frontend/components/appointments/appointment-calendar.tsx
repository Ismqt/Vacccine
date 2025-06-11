"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Appointment {
  id: string
  date: string
  time: string
  patientName: string
  status: string
}

interface AppointmentCalendarProps {
  appointments: Appointment[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export function AppointmentCalendar({ appointments, selectedDate, onDateSelect }: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return appointments.filter((apt) => apt.date === dateString)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const renderCalendarDays = () => {
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 p-1"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const dayAppointments = getAppointmentsForDate(date)
      const isSelected = selectedDate.toDateString() === date.toDateString()
      const isToday = new Date().toDateString() === date.toDateString()

      days.push(
        <div
          key={day}
          className={`h-20 p-1 border cursor-pointer hover:bg-gray-50 ${
            isSelected ? "bg-blue-50 border-blue-200" : ""
          } ${isToday ? "bg-yellow-50 border-yellow-200" : ""}`}
          onClick={() => onDateSelect(date)}
        >
          <div className="flex flex-col h-full">
            <span className={`text-sm font-medium ${isToday ? "text-yellow-800" : ""}`}>{day}</span>
            <div className="flex-1 space-y-1">
              {dayAppointments.slice(0, 2).map((apt, index) => (
                <div key={index} className="text-xs p-1 bg-blue-100 rounded truncate">
                  {apt.time}
                </div>
              ))}
              {dayAppointments.length > 2 && (
                <div className="text-xs text-gray-500">+{dayAppointments.length - 2} más</div>
              )}
            </div>
          </div>
        </div>,
      )
    }

    return days
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-200 rounded"></div>
          <span>Hoy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 rounded"></div>
          <span>Con citas</span>
        </div>
      </div>
    </div>
  )
}
