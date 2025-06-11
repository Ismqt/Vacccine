"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle } from "lucide-react"
import { BusinessRules } from "@/lib/business-rules"

interface VaccinationFormData {
  patientId: string
  vaccine: string
  manufacturer: string
  lot: string
  dose: string
  applicationDate: string
  responsibleStaff: string
  center: string
  observations?: string
}

interface VaccinationFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mockVaccines = [
  { id: "covid19", name: "COVID-19", manufacturers: ["Pfizer", "Moderna", "AstraZeneca"] },
  { id: "influenza", name: "Influenza", manufacturers: ["Sanofi", "GSK"] },
  { id: "hepatitisB", name: "Hepatitis B", manufacturers: ["GSK", "Merck"] },
  { id: "tetanus", name: "Tétanos", manufacturers: ["Sanofi"] },
]

const mockPatients = [
  { id: "1", name: "María González Pérez", cedula: "12345678", age: 34 },
  { id: "2", name: "Carlos Rodríguez López", cedula: "87654321", age: 39 },
  { id: "3", name: "Ana Martínez Jiménez", cedula: "11223344", age: 13 },
]

export function VaccinationFormModal({ open, onOpenChange }: VaccinationFormModalProps) {
  const [selectedVaccine, setSelectedVaccine] = useState("")
  const [selectedPatient, setSelectedPatient] = useState("")
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VaccinationFormData>()

  const selectedVaccineData = mockVaccines.find((v) => v.id === selectedVaccine)
  const selectedPatientData = mockPatients.find((p) => p.id === selectedPatient)

  const validateVaccination = (patientId: string, vaccine: string) => {
    const patient = mockPatients.find((p) => p.id === patientId)
    if (patient && vaccine) {
      const validation = BusinessRules.validateVaccinationAge(
        { ...patient, fechaNacimiento: new Date(patient.age * 365 * 24 * 60 * 60 * 1000) },
        vaccine,
      )
      if (!validation.valid) {
        toast({
          title: "Validación de Edad",
          description: validation.message,
          variant: "destructive",
        })
      }
    }
  }

  const onSubmit = (data: VaccinationFormData) => {
    try {
      // Here you would call your API
      console.log("Vaccination data:", data)

      toast({
        title: "Vacunación registrada",
        description: "La vacunación ha sido registrada exitosamente.",
      })

      reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al registrar la vacunación.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nueva Vacunación</DialogTitle>
          <DialogDescription>Complete la información de la vacuna aplicada</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Paciente *</Label>
              <Select
                onValueChange={(value) => {
                  setValue("patientId", value)
                  setSelectedPatient(value)
                  validateVaccination(value, selectedVaccine)
                }}
              >
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
              <Select
                onValueChange={(value) => {
                  setValue("vaccine", value)
                  setSelectedVaccine(value)
                  validateVaccination(selectedPatient, value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una vacuna" />
                </SelectTrigger>
                <SelectContent>
                  {mockVaccines.map((vaccine) => (
                    <SelectItem key={vaccine.id} value={vaccine.id}>
                      {vaccine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Fabricante *</Label>
              <Select onValueChange={(value) => setValue("manufacturer", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione fabricante" />
                </SelectTrigger>
                <SelectContent>
                  {selectedVaccineData?.manufacturers.map((manufacturer) => (
                    <SelectItem key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lot">Lote *</Label>
              <Input id="lot" {...register("lot", { required: "El lote es requerido" })} placeholder="Número de lote" />
              {errors.lot && <p className="text-sm text-red-500">{errors.lot.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dose">Dosis *</Label>
              <Select onValueChange={(value) => setValue("dose", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione dosis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1ra">1ra dosis</SelectItem>
                  <SelectItem value="2da">2da dosis</SelectItem>
                  <SelectItem value="3ra">3ra dosis</SelectItem>
                  <SelectItem value="refuerzo">Refuerzo</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicationDate">Fecha de Aplicación *</Label>
              <Input
                id="applicationDate"
                type="date"
                {...register("applicationDate", { required: "La fecha es requerida" })}
              />
              {errors.applicationDate && <p className="text-sm text-red-500">{errors.applicationDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibleStaff">Personal Responsable *</Label>
              <Input
                id="responsibleStaff"
                {...register("responsibleStaff", { required: "El responsable es requerido" })}
                placeholder="Nombre del personal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="center">Centro de Vacunación *</Label>
              <Select onValueChange={(value) => setValue("center", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione centro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="centro-norte">Centro Norte</SelectItem>
                  <SelectItem value="centro-sur">Centro Sur</SelectItem>
                  <SelectItem value="centro-este">Centro Este</SelectItem>
                  <SelectItem value="centro-oeste">Centro Oeste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedPatientData && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Validación Automática</span>
              </div>
              <p className="text-sm text-blue-700">
                Paciente: {selectedPatientData.name} ({selectedPatientData.age} años)
                <br />
                Verificar esquema de vacunación según edad y calendario nacional.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones</Label>
            <Textarea
              id="observations"
              {...register("observations")}
              placeholder="Observaciones adicionales (opcional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Registrar Vacunación</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
