"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import useApi from "@/hooks/use-api"

// Interfaces for API data
interface Provincia {
  id_Provincia: number
  Nombre: string
}
interface Municipio {
  id_Municipio: number
  Nombre: string
}
interface CentroVacunacion {
  id_CentroVacunacion: number
  Nombre: string
  Provincia: string
  Municipio: string
}
interface Vacuna {
  id_Vacuna: number
  Nombre: string
}

// Form data structure aligned with backend
interface AppointmentFormData {
  id_Nino: number | null
  id_Vacuna: number
  FechaCita: string
  HoraCita: string
  id_CentroVacunacion: number
}

interface AppointmentFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mock data for patients until the endpoint is available
const mockPatients = [
  { id: 1, name: "María González Pérez" },
  { id: 2, name: "Carlos Rodríguez López" },
]

const timeSlots = Array.from({ length: 18 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2)
  const minute = i % 2 === 0 ? "00" : "30"
  return `${String(hour).padStart(2, '0')}:${minute}`
})

export function AppointmentFormModal({ open, onOpenChange }: AppointmentFormModalProps) {
  const { toast } = useToast()
  const { request, loading } = useApi()

  const [provinces, setProvinces] = useState<Provincia[]>([])
  const [municipalities, setMunicipalities] = useState<Municipio[]>([])
  const [centers, setCenters] = useState<CentroVacunacion[]>([])
  const [vaccines, setVaccines] = useState<Vacuna[]>([])
  const [filteredCenters, setFilteredCenters] = useState<CentroVacunacion[]>([])

  const [selectedProvince, setSelectedProvince] = useState<string>("")
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("")

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AppointmentFormData>()

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!open) return;
      try {
        const [provincesData, centersData, vaccinesData] = await Promise.all([
          request("/api/locations/provinces"),
          request("/api/vaccination-centers"),
          request("/api/vaccines")
        ]);
        setProvinces(provincesData || []);
        setCenters(centersData || []);
        setVaccines(vaccinesData || []);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load initial data.", variant: "destructive" });
      }
    };
    fetchInitialData();
  }, [open, request, toast]);

  // Fetch municipalities when a province is selected
  useEffect(() => {
    const fetchMunicipalities = async () => {
      if (selectedProvince) {
        try {
          const municipalitiesData = await request(`/api/locations/municipalities/${selectedProvince}`);
          setMunicipalities(municipalitiesData || []);
        } catch (error) {
          toast({ title: "Error", description: "Failed to load municipalities.", variant: "destructive" });
          setMunicipalities([]);
        } finally {
          setValue("id_CentroVacunacion", 0);
          setSelectedMunicipality("");
        }
      } else {
        setMunicipalities([]);
      }
    };
    fetchMunicipalities();
  }, [selectedProvince, request, setValue, toast]);

  // Filter centers based on selected province and municipality
  useEffect(() => {
    const provinceName = provinces.find(p => p.id_Provincia === Number(selectedProvince))?.Nombre
    const municipalityName = municipalities.find(m => m.id_Municipio === Number(selectedMunicipality))?.Nombre

    if (provinceName && municipalityName) {
      setFilteredCenters(centers.filter(c => c.Provincia === provinceName && c.Municipio === municipalityName))
    } else if (provinceName) {
      setFilteredCenters(centers.filter(c => c.Provincia === provinceName))
    } else {
      setFilteredCenters([])
    }
  }, [selectedProvince, selectedMunicipality, centers, provinces, municipalities])

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      await request("/api/appointments", { method: "POST", body: data });
      toast({ title: "Cita agendada", description: "La cita ha sido programada exitosamente." });
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Ocurrió un error al agendar la cita.", variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Nueva Cita</DialogTitle>
          <DialogDescription>Complete la información para programar una cita de vacunación</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Patient Selector */}
            <div className="space-y-2">
              <Label>Paciente (Opcional)</Label>
              <Select onValueChange={(value) => setValue("id_Nino", value ? Number(value) : null)}>
                <SelectTrigger><SelectValue placeholder="Seleccione un paciente" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No asociar niño</SelectItem>
                  {mockPatients.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Province Selector */}
            <div className="space-y-2">
              <Label>Provincia *</Label>
              <Select onValueChange={setSelectedProvince}>
                <SelectTrigger><SelectValue placeholder="Seleccione una provincia" /></SelectTrigger>
                <SelectContent>
                  {provinces.map(p => <SelectItem key={p.id_Provincia} value={String(p.id_Provincia)}>{p.Nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Municipality Selector */}
            <div className="space-y-2">
              <Label>Municipio *</Label>
              <Select onValueChange={setSelectedMunicipality} disabled={!selectedProvince}>
                <SelectTrigger><SelectValue placeholder="Seleccione un municipio" /></SelectTrigger>
                <SelectContent>
                  {municipalities.map(m => <SelectItem key={m.id_Municipio} value={String(m.id_Municipio)}>{m.Nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Center Selector */}
            <div className="space-y-2">
              <Label>Centro *</Label>
              <Select onValueChange={(v) => setValue("id_CentroVacunacion", Number(v))} disabled={!selectedMunicipality}>
                <SelectTrigger><SelectValue placeholder="Seleccione un centro" /></SelectTrigger>
                <SelectContent>
                  {filteredCenters.map(c => <SelectItem key={c.id_CentroVacunacion} value={String(c.id_CentroVacunacion)}>{c.Nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Vaccine Selector */}
            <div className="space-y-2">
              <Label>Vacuna *</Label>
              <Select onValueChange={(v) => setValue("id_Vacuna", Number(v))}>
                <SelectTrigger><SelectValue placeholder="Seleccione una vacuna" /></SelectTrigger>
                <SelectContent>
                  {vaccines.map(v => <SelectItem key={v.id_Vacuna} value={String(v.id_Vacuna)}>{v.Nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="FechaCita">Fecha *</Label>
              <Input id="FechaCita" type="date" {...register("FechaCita", { required: true })} />
            </div>

            {/* Time Slot Selector */}
            <div className="space-y-2">
              <Label>Hora *</Label>
              <Select onValueChange={(v) => setValue("HoraCita", v)}>
                <SelectTrigger><SelectValue placeholder="Seleccione una hora" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>Agendar Cita</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
