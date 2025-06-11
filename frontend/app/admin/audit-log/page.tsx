"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Search, User, Edit, Plus, Trash2, Eye } from "lucide-react"

const mockAuditLogs = [
  {
    id: "1",
    timestamp: "2024-01-20T10:30:00Z",
    user: "Dr. Juan Pérez",
    action: "CREATE",
    resource: "Paciente",
    resourceId: "PAT-001",
    details: "Creó nuevo paciente: María González",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
  {
    id: "2",
    timestamp: "2024-01-20T09:15:00Z",
    user: "Dra. Ana López",
    action: "UPDATE",
    resource: "Vacunación",
    resourceId: "VAC-045",
    details: "Actualizó registro de vacunación COVID-19",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "3",
    timestamp: "2024-01-20T08:45:00Z",
    user: "Admin Sistema",
    action: "DELETE",
    resource: "Centro",
    resourceId: "CEN-003",
    details: "Eliminó centro de vacunación inactivo",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
  },
  {
    id: "4",
    timestamp: "2024-01-19T16:20:00Z",
    user: "Dr. Carlos Ruiz",
    action: "VIEW",
    resource: "Reporte",
    resourceId: "REP-012",
    details: "Consultó reporte de cobertura mensual",
    ipAddress: "192.168.1.103",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
  {
    id: "5",
    timestamp: "2024-01-19T14:10:00Z",
    user: "Digitador María",
    action: "CREATE",
    resource: "Cita",
    resourceId: "CIT-089",
    details: "Programó nueva cita de vacunación",
    ipAddress: "192.168.1.104",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
]

const getActionIcon = (action: string) => {
  switch (action) {
    case "CREATE":
      return <Plus className="h-4 w-4 text-green-600" />
    case "UPDATE":
      return <Edit className="h-4 w-4 text-blue-600" />
    case "DELETE":
      return <Trash2 className="h-4 w-4 text-red-600" />
    case "VIEW":
      return <Eye className="h-4 w-4 text-gray-600" />
    default:
      return <User className="h-4 w-4" />
  }
}

const getActionColor = (action: string) => {
  switch (action) {
    case "CREATE":
      return "default"
    case "UPDATE":
      return "secondary"
    case "DELETE":
      return "destructive"
    case "VIEW":
      return "outline"
    default:
      return "outline"
  }
}

export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAction, setSelectedAction] = useState("all")
  const [selectedResource, setSelectedResource] = useState("all")

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = selectedAction === "all" || log.action === selectedAction
    const matchesResource = selectedResource === "all" || log.resource === selectedResource

    return matchesSearch && matchesAction && matchesResource
  })

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Administración", href: "/admin" },
    { label: "Bitácora de Auditoría" },
  ]

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Bitácora de Auditoría
          </h1>
          <p className="text-muted-foreground">Registro completo de todas las acciones realizadas en el sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAuditLogs.length}</div>
              <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Creaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockAuditLogs.filter((log) => log.action === "CREATE").length}
              </div>
              <p className="text-xs text-muted-foreground">Nuevos registros</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Modificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {mockAuditLogs.filter((log) => log.action === "UPDATE").length}
              </div>
              <p className="text-xs text-muted-foreground">Actualizaciones</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Eliminaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {mockAuditLogs.filter((log) => log.action === "DELETE").length}
              </div>
              <p className="text-xs text-muted-foreground">Registros eliminados</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Búsqueda</CardTitle>
            <CardDescription>Filtre los registros de auditoría por diferentes criterios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Usuario, acción o detalles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Acción</label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las acciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las acciones</SelectItem>
                    <SelectItem value="CREATE">Crear</SelectItem>
                    <SelectItem value="UPDATE">Actualizar</SelectItem>
                    <SelectItem value="DELETE">Eliminar</SelectItem>
                    <SelectItem value="VIEW">Ver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Recurso</label>
                <Select value={selectedResource} onValueChange={setSelectedResource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los recursos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los recursos</SelectItem>
                    <SelectItem value="Paciente">Paciente</SelectItem>
                    <SelectItem value="Vacunación">Vacunación</SelectItem>
                    <SelectItem value="Centro">Centro</SelectItem>
                    <SelectItem value="Cita">Cita</SelectItem>
                    <SelectItem value="Reporte">Reporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registro de Eventos</CardTitle>
            <CardDescription>Historial cronológico de todas las acciones del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {log.user}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionColor(log.action)} className="flex items-center gap-1 w-fit">
                          {getActionIcon(log.action)}
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.resource}</div>
                          <div className="text-sm text-muted-foreground">{log.resourceId}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={log.details}>
                          {log.details}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.ipAddress}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron registros de auditoría</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
