"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar"
import { AppointmentFormModal } from "@/components/appointments/appointment-form-modal"
import { Plus, Calendar, Clock, Users, CheckCircle } from "lucide-react"

const mockAppointments = [
  {
    id: "1",
    patientName: "María González",
    patientCedula: "12345678",
    vaccine: "COVID-19 (2da dosis)",
    date: "2024-01-20",
    time: "09:30",
    center: "Centro Norte",
    status: "scheduled",
    staff: "Dr. Juan Pérez",
  },
  {
    id: "2",
    patientName: "Carlos Rodríguez",
    patientCedula: "87654321",
    vaccine: "Influenza",
    date: "2024-01-20",
    time: "10:15",
    center: "Centro Sur",
    status: "completed",
    staff: "Dra. Ana López",
  },
  {
    id: "3",
    patientName: "Ana Martínez",
    patientCedula: "11223344",
    vaccine: "Hepatitis B (1ra dosis)",
    date: "2024-01-21",
    time: "11:00",
    center: "Centro Norte",
    status: "scheduled",
    staff: "Dr. Juan Pérez",
  },
]

export default function AppointmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const todayAppointments = mockAppointments.filter((apt) => apt.date === new Date().toISOString().split("T")[0])

  const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }, { label: "Citas" }]

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Citas</h1>
            <p className="text-muted-foreground">Programa y gestiona las citas de vacunación</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cita
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayAppointments.filter((a) => a.status === "completed").length} completadas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">Programadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Próximo Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">Agendadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Asistencia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">94%</div>
              <p className="text-xs text-muted-foreground">Último mes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Calendar */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendario de Citas
              </CardTitle>
              <CardDescription>Vista mensual de todas las citas programadas</CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentCalendar
                appointments={mockAppointments}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Citas de Hoy
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{appointment.time}</span>
                      <Badge variant={appointment.status === "completed" ? "default" : "secondary"}>
                        {appointment.status === "completed" ? "Completada" : "Programada"}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patientName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.vaccine}</p>
                      <p className="text-sm text-muted-foreground">{appointment.center}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay citas programadas para hoy</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Próximas Citas
            </CardTitle>
            <CardDescription>Citas programadas para los próximos días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAppointments
                .filter((apt) => new Date(apt.date) > new Date())
                .slice(0, 5)
                .map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-medium">
                          {new Date(appointment.date).toLocaleDateString("es-ES", { day: "2-digit" })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(appointment.date).toLocaleDateString("es-ES", { month: "short" })}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{appointment.patientName}</p>
                        <p className="text-sm text-muted-foreground">{appointment.vaccine}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.time} - {appointment.center}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {appointment.status === "scheduled" ? "Programada" : "Completada"}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <AppointmentFormModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </DashboardLayout>
  )
}
