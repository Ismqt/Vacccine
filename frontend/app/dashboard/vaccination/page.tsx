"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { VaccinationFormModal } from "@/components/vaccination/vaccination-form-modal"
import { VaccinationHistoryModal } from "@/components/vaccination/vaccination-history-modal"
import { Search, Plus, FileText, Download, Syringe, Calendar, Filter } from "lucide-react"
import { AdvancedSearchModal } from "@/components/advanced-search/advanced-search-modal"
import { BusinessRules } from "@/lib/business-rules"

const mockVaccinations = [
  {
    id: "1",
    patientId: "1",
    patientName: "María González Pérez",
    patientCedula: "12345678",
    vaccine: "COVID-19",
    manufacturer: "Pfizer",
    lot: "ABC123",
    dose: "1ra dosis",
    applicationDate: "2024-01-15",
    ageAtApplication: "34 años",
    responsibleStaff: "Dr. Juan Pérez",
    center: "Centro Norte",
    nextDueDate: "2024-02-15",
  },
  {
    id: "2",
    patientId: "2",
    patientName: "Carlos Rodríguez López",
    patientCedula: "87654321",
    vaccine: "Influenza",
    manufacturer: "Sanofi",
    lot: "XYZ789",
    dose: "Anual",
    applicationDate: "2024-01-10",
    ageAtApplication: "39 años",
    responsibleStaff: "Dra. Ana López",
    center: "Centro Sur",
    nextDueDate: "2025-01-10",
  },
]

export default function VaccinationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isAdvancedSearchModalOpen, setIsAdvancedSearchModalOpen] = useState(false)

  const filteredVaccinations = mockVaccinations.filter(
    (vaccination) =>
      vaccination.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaccination.patientCedula.includes(searchTerm) ||
      vaccination.vaccine.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }, { label: "Vacunación" }]

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Vacunación</h1>
            <p className="text-muted-foreground">Registra y gestiona las vacunaciones aplicadas</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsAdvancedSearchModalOpen(true)}>
              <Filter className="mr-2 h-4 w-4" />
              Búsqueda Avanzada
            </Button>
            <Button onClick={() => setIsFormModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Vacunación
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vacunaciones Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">+15% vs ayer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">Meta: 200</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Próximas Dosis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">45</div>
              <p className="text-xs text-muted-foreground">Próximos 7 días</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Esquemas Completos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">89%</div>
              <p className="text-xs text-muted-foreground">Cobertura actual</p>
            </CardContent>
          </Card>
        </div>

        {/* Vaccination Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5" />
              Registros de Vacunación
            </CardTitle>
            <CardDescription>Historial completo de vacunaciones aplicadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, cédula o vacuna..."
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
                    <TableHead>Paciente</TableHead>
                    <TableHead>Vacuna</TableHead>
                    <TableHead>Fabricante</TableHead>
                    <TableHead>Dosis</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Próxima Dosis</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVaccinations.map((vaccination) => (
                    <TableRow key={vaccination.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vaccination.patientName}</div>
                          <div className="text-sm text-muted-foreground">{vaccination.patientCedula}</div>
                        </div>
                      </TableCell>
                      <TableCell>{vaccination.vaccine}</TableCell>
                      <TableCell>{vaccination.manufacturer}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{vaccination.dose}</Badge>
                      </TableCell>
                      <TableCell>{new Date(vaccination.applicationDate).toLocaleDateString()}</TableCell>
                      <TableCell>{vaccination.responsibleStaff}</TableCell>
                      <TableCell>
                        {vaccination.nextDueDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(vaccination.nextDueDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(vaccination)
                              setIsHistoryModalOpen(true)
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
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

      <VaccinationFormModal open={isFormModalOpen} onOpenChange={setIsFormModalOpen} businessRules={BusinessRules} />

      <VaccinationHistoryModal
        open={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
        patient={selectedPatient}
      />
      <AdvancedSearchModal open={isAdvancedSearchModalOpen} onOpenChange={setIsAdvancedSearchModalOpen} />
    </DashboardLayout>
  )
}
