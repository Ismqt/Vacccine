"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, CheckCircle, Bell, Users, Calendar, Syringe } from "lucide-react"

const mockAlerts = [
  {
    id: "1",
    type: "vaccination_due",
    priority: "high",
    title: "Dosis Vencidas",
    message: "12 pacientes tienen dosis de vacunación vencidas",
    count: 12,
    date: "2024-01-20",
    action: "Ver Pacientes",
  },
  {
    id: "2",
    type: "appointment_reminder",
    priority: "medium",
    title: "Citas Próximas",
    message: "23 citas programadas para mañana",
    count: 23,
    date: "2024-01-20",
    action: "Ver Citas",
  },
  {
    id: "3",
    type: "incomplete_scheme",
    priority: "high",
    title: "Esquemas Incompletos",
    message: "45 pacientes con esquemas de vacunación incompletos",
    count: 45,
    date: "2024-01-19",
    action: "Generar Reporte",
  },
  {
    id: "4",
    type: "stock_low",
    priority: "medium",
    title: "Stock Bajo",
    message: "Vacuna COVID-19 con stock bajo en Centro Norte",
    count: 1,
    date: "2024-01-19",
    action: "Gestionar Stock",
  },
  {
    id: "5",
    type: "coverage_goal",
    priority: "low",
    title: "Meta Alcanzada",
    message: "Centro Este alcanzó 95% de cobertura mensual",
    count: 1,
    date: "2024-01-18",
    action: "Ver Detalles",
  },
]

const getAlertIcon = (type: string) => {
  switch (type) {
    case "vaccination_due":
      return <Syringe className="h-4 w-4" />
    case "appointment_reminder":
      return <Calendar className="h-4 w-4" />
    case "incomplete_scheme":
      return <Users className="h-4 w-4" />
    case "stock_low":
      return <AlertTriangle className="h-4 w-4" />
    case "coverage_goal":
      return <CheckCircle className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "destructive"
    case "medium":
      return "default"
    case "low":
      return "secondary"
    default:
      return "outline"
  }
}

export default function AlertsPage() {
  const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }, { label: "Alertas" }]

  const highPriorityAlerts = mockAlerts.filter((alert) => alert.priority === "high")
  const mediumPriorityAlerts = mockAlerts.filter((alert) => alert.priority === "medium")
  const lowPriorityAlerts = mockAlerts.filter((alert) => alert.priority === "low")

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alertas y Seguimiento</h1>
          <p className="text-muted-foreground">Monitoreo automático de eventos importantes del sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAlerts.length}</div>
              <p className="text-xs text-muted-foreground">{highPriorityAlerts.length} de alta prioridad</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dosis Vencidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">12</div>
              <p className="text-xs text-muted-foreground">Requieren atención</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Citas Mañana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">23</div>
              <p className="text-xs text-muted-foreground">Programadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Esquemas Incompletos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">45</div>
              <p className="text-xs text-muted-foreground">Pacientes</p>
            </CardContent>
          </Card>
        </div>

        {/* High Priority Alerts */}
        {highPriorityAlerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Alta Prioridad
              </CardTitle>
              <CardDescription>Requieren atención inmediata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {highPriorityAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-red-600 mt-1">{getAlertIcon(alert.type)}</div>
                    <div>
                      <h4 className="font-semibold text-red-800">{alert.title}</h4>
                      <p className="text-sm text-red-700">{alert.message}</p>
                      <p className="text-xs text-red-600 mt-1">{new Date(alert.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{alert.priority}</Badge>
                    <Button variant="outline" size="sm">
                      {alert.action}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Medium Priority Alerts */}
        {mediumPriorityAlerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <Clock className="h-5 w-5" />
                Alertas de Prioridad Media
              </CardTitle>
              <CardDescription>Requieren seguimiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mediumPriorityAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-600 mt-1">{getAlertIcon(alert.type)}</div>
                    <div>
                      <h4 className="font-semibold">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(alert.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(alert.priority)}>{alert.priority}</Badge>
                    <Button variant="outline" size="sm">
                      {alert.action}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Low Priority Alerts */}
        {lowPriorityAlerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Notificaciones Informativas
              </CardTitle>
              <CardDescription>Información general del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowPriorityAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="flex items-start gap-3">
                    <div className="text-green-600 mt-1">{getAlertIcon(alert.type)}</div>
                    <div>
                      <h4 className="font-semibold text-green-800">{alert.title}</h4>
                      <p className="text-sm text-green-700">{alert.message}</p>
                      <p className="text-xs text-green-600 mt-1">{new Date(alert.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{alert.priority}</Badge>
                    <Button variant="outline" size="sm">
                      {alert.action}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
