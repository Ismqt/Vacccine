"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CenterFormModal } from "@/components/centers/center-form-modal"
import { Plus, Search, Edit, Eye, MapPin, Phone, Users, AlertCircle, Loader } from "lucide-react"
import useApi from "@/hooks/use-api"

// Interface based on the database schema and UI requirements
interface VaccinationCenter {
  id_CentroVacunacion: number;
  Nombre: string; // Matches API alias
  Direccion: string;
  Provincia: string | null; // From LEFT JOIN
  Municipio: string | null; // From LEFT JOIN
  Telefono: string | null;
  Director: string | null;
  Web?: string | null;
  Capacidad: number;
  Estado: "Activo" | "Mantenimiento" | "Inactivo";
}

export default function CentersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState<VaccinationCenter | null>(null)

  const [centers, setCenters] = useState<VaccinationCenter[] | null>(null)

  // Use the API hook to fetch centers
    const { loading: isLoading, error, request: callApi } = useApi()

  const fetchCenters = useCallback(async () => {
    try {
      const data = await callApi("/api/vaccination-centers")
      setCenters(data)
    } catch (e) {
      // Error is handled by the hook
      console.error("Error fetching centers:", e)
    }
  }, [callApi])

  useEffect(() => {
    fetchCenters()
  }, [fetchCenters])

  const filteredCenters = useMemo(() => {
    if (!centers) return [];

    const lowercasedSearchTerm = searchTerm.toLowerCase();

    return centers.filter(center => {
      // Check if any of the relevant fields include the search term, handling potential null/undefined values
      const nombre = (center.Nombre || '').toLowerCase();
      const provincia = (center.Provincia || '').toLowerCase();
      const municipio = (center.Municipio || '').toLowerCase();
      const direccion = (center.Direccion || '').toLowerCase();

      return (
        nombre.includes(lowercasedSearchTerm) ||
        provincia.includes(lowercasedSearchTerm) ||
        municipio.includes(lowercasedSearchTerm) ||
        direccion.includes(lowercasedSearchTerm)
      );
    });
  }, [centers, searchTerm]);

  const stats = useMemo(() => {
    if (!centers || centers.length === 0) {
      return {
        total: 0,
        active: 0,
        totalCapacity: 0,
      };
    }

    const totalCapacity = centers.reduce((acc, center) => acc + (Number(center.Capacidad) || 0), 0);
    const activeCenters = centers.filter(center => center.Estado === 'Activo').length;

    return {
      total: centers.length,
      active: activeCenters,
      totalCapacity,
    };
  }, [centers]);

  const handleEdit = (center: VaccinationCenter) => {
    setSelectedCenter(center)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedCenter(null)
    setIsModalOpen(true)
  }
  
  const handleFormSubmit = () => {
    fetchCenters();
    setIsModalOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centros de Vacunación</h1>
          <p className="text-muted-foreground">Gestiona los centros de vacunación del sistema</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Centro
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Centros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Loader className="h-6 w-6 animate-spin" /> : stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.active} activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Loader className="h-6 w-6 animate-spin" /> : stats.totalCapacity}</div>
            <p className="text-xs text-muted-foreground">Pacientes máximos</p>
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
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <div className="flex justify-center items-center p-4">
                        <Loader className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Cargando centros...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-red-500">
                       <div className="flex justify-center items-center p-4">
                        <AlertCircle className="h-6 w-6" />
                        <span className="ml-2">Error al cargar los datos. Por favor, intente de nuevo.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCenters.length > 0 ? (
                  filteredCenters.map((center) => (
                    <TableRow key={center.id_CentroVacunacion}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{center.Nombre}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {center.Direccion}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{center.Director}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {center.Telefono}
                          </div>
                          {center.Web && (
                            <div className="text-sm text-muted-foreground">{center.Web}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {center.Capacidad}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={center.Estado === "Activo" ? "default" : "secondary"}>
                          {center.Estado}
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
                            onClick={() => handleEdit(center)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                   <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No se encontraron centros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <CenterFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        center={selectedCenter}
        onFormSubmit={handleFormSubmit}
      />
    </div>
  )
}
