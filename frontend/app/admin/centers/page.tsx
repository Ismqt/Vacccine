"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CenterFormModal } from "@/components/centers/center-form-modal"
import { Plus, Search, Edit, Eye, MapPin, Phone, Users } from "lucide-react"

const mockCenters = [
  {
    id: "1",
    name: "Centro Norte",
    address: "Av. Central 123, San José",
    phone: "2222-3333",
    email: "norte@salud.go.cr",
    director: "Dr. María Rodríguez",
    capacity: 200,
    currentPatients: 156,
    status: "active",
    coordinates: { lat: 9.9281, lng: -84.0907 },
  },
  {
    id: "2",
    name: "Centro Sur",
    address: "Calle 5, Cartago",
    phone: "2551-4444",
    email: "sur@salud.go.cr",
    director: "Dr. Carlos López",
    capacity: 150,
    currentPatients: 98,
    status: "active",
    coordinates: { lat: 9.8644, lng: -83.9194 },
  },
  {
    id: "3",
    name: "Centro Este",
    address: "Av. 2, Heredia",
    phone: "2260-5555",
    email: "este@salud.go.cr",
    director: "Dra. Ana Jiménez",
    capacity: 180,
    currentPatients: 134,
    status: "maintenance",
    coordinates: { lat: 9.9989, lng: -84.1165 },
  },
]

export default function CentersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState(null)

  const filteredCenters = mockCenters.filter(
    (center) =>
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Administración", href: "/admin" },
    { label: "Centros de Vacunación" },
  ]

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Centros de Vacunación</h1>
            <p className="text-muted-foreground">Gestiona los centros de vacunación del sistema</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Centro
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Centros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockCenters.length}</div>
              <p className="text-xs text-muted-foreground">
                {mockCenters.filter((c) => c.status === "active").length} activos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockCenters.reduce((sum, center) => sum + center.capacity, 0)}</div>
              <p className="text-xs text-muted-foreground">Pacientes máximos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pacientes Actuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockCenters.reduce((sum, center) => sum + center.currentPatients, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Registrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ocupación Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">73%</div>
              <p className="text-xs text-muted-foreground">De la capacidad</p>
            </CardContent>
          </Card>
        </div>

        {/* Centers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Lista de Centros
            </CardTitle>
            <CardDescription>Administra la información de los centros de vacunación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, director o dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Centro</TableHead>
                    <TableHead>Director</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Capacidad</TableHead>
                    <TableHead>Ocupación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCenters.map((center) => (
                    <TableRow key={center.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{center.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {center.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{center.director}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {center.phone}
                          </div>
                          <div className="text-sm text-muted-foreground">{center.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {center.capacity}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {center.currentPatients}/{center.capacity}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(center.currentPatients / center.capacity) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={center.status === "active" ? "default" : "secondary"}>
                          {center.status === "active" ? "Activo" : "Mantenimiento"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCenter(center)
                              setIsModalOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <CenterFormModal open={isModalOpen} onOpenChange={setIsModalOpen} center={selectedCenter} />
    </DashboardLayout>
  )
}
