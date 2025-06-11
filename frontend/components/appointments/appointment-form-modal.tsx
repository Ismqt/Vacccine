"use client"

import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface AppointmentFormData {
  patientId: string
  vaccine: string
  date: string
  time: string
  center: string
  staff: string
  notes?: string
}

interface AppointmentFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mockPatients = [
  { id: "1", name: "María González Pérez", cedula: "12345678" },
  { id: "2", name: "Carlos Rodríguez López", cedula: "87654321" },
  { id: "3", name: "Ana Martínez Jiménez", cedula: "11223344" },
]

const mockVaccines = ["COVID-19 (1ra dosis)", "COVID-19 (2da dosis)", "Influenza", "Hepatitis B", "Tétanos"]

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
]

export function AppointmentFormModal({ open, onOpenChange }: AppointmentFormModalProps) {
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<AppointmentFormData>()

  const onSubmit = (data: AppointmentFormData) => {
    try {
      console.log("Appointment data:", data)

      toast({
        title: "Cita agendada",
        description: "La cita ha sido programada exitosamente.",
      })

      reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al agendar la cita.",
        variant: "destructive",
      })
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
            <div className="space-y-2">
              <Label htmlFor="patientId">Paciente *</Label>
              <Select onValueChange={(value) => setValue("patientId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un paciente" />
                </SelectTrigger>
                <SelectContent>
                  {mockPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} - {patient.cedula}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vaccine">Vacuna *</Label>
              <Select onValueChange={(value) => setValue("vaccine", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una vacuna" />
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
              <Label htmlFor="date">Fecha *</Label>
              <Input id="date" type="date" {...register("date", { required: "La fecha es requerida" })} />
              {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora *</Label>
              <Select onValueChange={(value) => setValue("time", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una hora" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="center">Centro *</Label>
              <Select onValueChange={(value) => setValue("center", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un centro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="centro-norte">Centro Norte</SelectItem>
                  <SelectItem value="centro-sur">Centro Sur</SelectItem>
                  <SelectItem value="centro-este">Centro Este</SelectItem>
                  <SelectItem value="centro-oeste">Centro Oeste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff">Personal Asignado *</Label>
              <Input
                id="staff"
                {...register("staff", { required: "El personal es requerido" })}
                placeholder="Nombre del personal"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Notas adicionales (opcional)" rows={3} />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Agendar Cita</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
