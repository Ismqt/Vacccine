"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PatientFormModal } from "@/components/patients/patient-form-modal"
import { usePatientsStore } from "@/lib/store"
import { Plus, Search, Eye, Edit, FileText, Filter, Download } from "lucide-react"
import { AdvancedSearchModal } from "@/components/advanced-search/advanced-search-modal"
import { PDFGenerator } from "@/lib/pdf-generator"

// Mock data
const mockPatients = [
  {
    id: "1",
    cedula: "12345678",
    nombreCompleto: "María González Pérez",
    fechaNacimiento: "1990-05-15",
    genero: "F" as const,
    pais: "Costa Rica",
    direccion: "San José, Costa Rica",
    centroAsignado: "Centro Norte",
    esquemaCompleto: true,
  },
  {
    id: "2",
    cedula: "87654321",
    nombreCompleto: "Carlos Rodríguez López",
    fechaNacimiento: "1985-12-03",
    genero: "M" as const,
    pais: "Costa Rica",
    direccion: "Cartago, Costa Rica",
    centroAsignado: "Centro Sur",
    esquemaCompleto: false,
  },
  {
    id: "3",
    cedula: "11223344",
    nombreCompleto: "Ana Martínez Jiménez",
    fechaNacimiento: "2010-08-22",
    genero: "F" as const,
    pais: "Costa Rica",
    direccion: "Heredia, Costa Rica",
    centroAsignado: "Centro Norte",
    esquemaCompleto: true,
  },
]

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const { patients, setPatients } = usePatientsStore()
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false)
  const [searchFilters, setSearchFilters] = useState({})

  // Initialize with mock data if empty
  if (patients.length === 0) {
    setPatients(mockPatients)
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) || patient.cedula.includes(searchTerm),
  )

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }, { label: "Pacientes" }]

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Pacientes</h1>
            <p className="text-muted-foreground">Administra la información de todos los pacientes registrados</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Paciente
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Esquemas Completos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {patients.filter((p) => p.esquemaCompleto).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Esquemas Incompletos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {patients.filter((p) => !p.esquemaCompleto).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Menores de Edad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients.filter((p) => calculateAge(p.fechaNacimiento) < 18).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pacientes</CardTitle>
            <CardDescription>Busca y gestiona la información de los pacientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" onClick={() => setIsAdvancedSearchOpen(true)}>
                <Filter className="mr-2 h-4 w-4" />
                Búsqueda Avanzada
              </Button>
            </div>

            {/* Patients Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Género</TableHead>
                    <TableHead>Centro Asignado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.cedula}</TableCell>
                      <TableCell>{patient.nombreCompleto}</TableCell>
                      <TableCell>{calculateAge(patient.fechaNacimiento)} años</TableCell>
                      <TableCell>{patient.genero === "M" ? "Masculino" : "Femenino"}</TableCell>
                      <TableCell>{patient.centroAsignado}</TableCell>
                      <TableCell>
                        <Badge variant={patient.esquemaCompleto ? "default" : "secondary"}>
                          {patient.esquemaCompleto ? "Completo" : "Incompleto"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => PDFGenerator.generateVaccinationCard(patient, [])}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredPatients.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No se encontraron pacientes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PatientFormModal open={isModalOpen} onOpenChange={setIsModalOpen} patient={selectedPatient} />
      <AdvancedSearchModal
        open={isAdvancedSearchOpen}
        onOpenChange={setIsAdvancedSearchOpen}
        onSearch={(filters) => setSearchFilters(filters)}
        searchType="patients"
      />
    </DashboardLayout>
  )
}
