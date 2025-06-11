"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, X, Filter } from "lucide-react"

interface AdvancedSearchFilters {
  // Patient filters
  cedula?: string
  nombreCompleto?: string
  ageRange?: { min: number; max: number }
  genero?: "M" | "F" | "all"

  // Vaccination filters
  vaccine?: string
  manufacturer?: string
  dateRange?: { from: string; to: string }
  doseType?: string
  completionStatus?: "complete" | "incomplete" | "all"

  // Center filters
  center?: string

  // Tutor filters (for business rules)
  tutorName?: string
  tutorCedula?: string
}

interface AdvancedSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSearch: (filters: AdvancedSearchFilters) => void
  searchType: "patients" | "vaccinations" | "appointments"
}

const mockVaccines = ["COVID-19", "Influenza", "Hepatitis B", "Tétanos", "Sarampión"]
const mockManufacturers = ["Pfizer", "Moderna", "AstraZeneca", "Sanofi", "GSK"]
const mockCenters = ["Centro Norte", "Centro Sur", "Centro Este", "Centro Oeste"]

export function AdvancedSearchModal({ open, onOpenChange, onSearch, searchType }: AdvancedSearchModalProps) {
  const [filters, setFilters] = useState<AdvancedSearchFilters>({})
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const updateFilter = (key: keyof AdvancedSearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    if (value && !activeFilters.includes(key)) {
      setActiveFilters((prev) => [...prev, key])
    } else if (!value && activeFilters.includes(key)) {
      setActiveFilters((prev) => prev.filter((f) => f !== key))
    }
  }

  const removeFilter = (key: keyof AdvancedSearchFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
    setActiveFilters((prev) => prev.filter((f) => f !== key))
  }

  const handleSearch = () => {
    onSearch(filters)
    onOpenChange(false)
  }

  const clearAllFilters = () => {
    setFilters({})
    setActiveFilters([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Búsqueda Avanzada -{" "}
            {searchType === "patients" ? "Pacientes" : searchType === "vaccinations" ? "Vacunaciones" : "Citas"}
          </DialogTitle>
          <DialogDescription>Configure múltiples filtros para encontrar exactamente lo que busca</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="space-y-2">
              <Label>Filtros Activos:</Label>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filterKey) => (
                  <Badge key={filterKey} variant="secondary" className="flex items-center gap-1">
                    {filterKey}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFilter(filterKey as keyof AdvancedSearchFilters)}
                    />
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Limpiar Todo
                </Button>
              </div>
            </div>
          )}

          {/* Patient Information Filters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Paciente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cedula">Cédula</Label>
                <Input
                  id="cedula"
                  placeholder="Buscar por cédula..."
                  value={filters.cedula || ""}
                  onChange={(e) => updateFilter("cedula", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombreCompleto">Nombre Completo</Label>
                <Input
                  id="nombreCompleto"
                  placeholder="Buscar por nombre..."
                  value={filters.nombreCompleto || ""}
                  onChange={(e) => updateFilter("nombreCompleto", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Rango de Edad</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={filters.ageRange?.min || ""}
                    onChange={(e) =>
                      updateFilter("ageRange", {
                        ...filters.ageRange,
                        min: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={filters.ageRange?.max || ""}
                    onChange={(e) =>
                      updateFilter("ageRange", {
                        ...filters.ageRange,
                        max: Number.parseInt(e.target.value) || 100,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="genero">Género</Label>
                <Select onValueChange={(value) => updateFilter("genero", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tutor Information (Business Rule: Tutors manage children) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Tutor</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tutorName">Nombre del Tutor</Label>
                <Input
                  id="tutorName"
                  placeholder="Buscar por nombre del tutor..."
                  value={filters.tutorName || ""}
                  onChange={(e) => updateFilter("tutorName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tutorCedula">Cédula del Tutor</Label>
                <Input
                  id="tutorCedula"
                  placeholder="Buscar por cédula del tutor..."
                  value={filters.tutorCedula || ""}
                  onChange={(e) => updateFilter("tutorCedula", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Vaccination Filters */}
          {(searchType === "vaccinations" || searchType === "appointments") && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información de Vacunación</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vaccine">Tipo de Vacuna</Label>
                  <Select onValueChange={(value) => updateFilter("vaccine", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar vacuna" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVaccines.map((vaccine) => (
                        <SelectItem key={vaccine} value={vaccine}>
                          {vaccine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Fabricante</Label>
                  <Select onValueChange={(value) => updateFilter("manufacturer", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar fabricante" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockManufacturers.map((manufacturer) => (
                        <SelectItem key={manufacturer} value={manufacturer}>
                          {manufacturer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rango de Fechas</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={filters.dateRange?.from || ""}
                      onChange={(e) =>
                        updateFilter("dateRange", {
                          ...filters.dateRange,
                          from: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="date"
                      value={filters.dateRange?.to || ""}
                      onChange={(e) =>
                        updateFilter("dateRange", {
                          ...filters.dateRange,
                          to: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="completionStatus">Estado del Esquema</Label>
                  <Select onValueChange={(value) => updateFilter("completionStatus", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado del esquema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="complete">Completo</SelectItem>
                      <SelectItem value="incomplete">Incompleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Center Filters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Centro de Vacunación</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="center">Centro</Label>
                <Select onValueChange={(value) => updateFilter("center", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar centro" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCenters.map((center) => (
                      <SelectItem key={center} value={center}>
                        {center}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSearch} className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
