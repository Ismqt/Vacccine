"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { usePatientsStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface PatientFormData {
  cedula: string
  nombreCompleto: string
  fechaNacimiento: string
  genero: "M" | "F"
  pais: string
  direccion: string
  centroAsignado: string
  tutor1?: {
    nombre: string
    cedula: string
    telefono: string
    email: string
    direccion: string
  }
  tutor2?: {
    nombre: string
    cedula: string
    telefono: string
    email: string
    direccion: string
  }
}

interface PatientFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient?: any
}

const mockCenters = [
  { id: "centro-1", name: "Centro Norte" },
  { id: "centro-2", name: "Centro Sur" },
  { id: "centro-3", name: "Centro Este" },
  { id: "centro-4", name: "Centro Oeste" },
]

export function PatientFormModal({ open, onOpenChange, patient }: PatientFormModalProps) {
  const [activeTab, setActiveTab] = useState("patient")
  const { addPatient, updatePatient } = usePatientsStore()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PatientFormData>({
    defaultValues: patient || {},
  })

  const onSubmit = (data: PatientFormData) => {
    try {
      if (patient) {
        updatePatient(patient.id, data)
        toast({
          title: "Paciente actualizado",
          description: "La información del paciente ha sido actualizada exitosamente.",
        })
      } else {
        const newPatient = {
          id: Date.now().toString(),
          ...data,
          esquemaCompleto: false,
        }
        addPatient(newPatient)
        toast({
          title: "Paciente registrado",
          description: "El paciente ha sido registrado exitosamente.",
        })
      }

      reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la información.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{patient ? "Editar Paciente" : "Registrar Nuevo Paciente"}</DialogTitle>
          <DialogDescription>Complete la información del paciente y sus tutores (si aplica)</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="patient">Datos del Paciente</TabsTrigger>
              <TabsTrigger value="tutor1">Tutor 1</TabsTrigger>
              <TabsTrigger value="tutor2">Tutor 2 (Opcional)</TabsTrigger>
            </TabsList>

            <TabsContent value="patient" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cedula">Cédula/Código *</Label>
                  <Input
                    id="cedula"
                    {...register("cedula", { required: "La cédula es requerida" })}
                    placeholder="Ingrese la cédula"
                  />
                  {errors.cedula && <p className="text-sm text-red-500">{errors.cedula.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
                  <Input
                    id="nombreCompleto"
                    {...register("nombreCompleto", { required: "El nombre es requerido" })}
                    placeholder="Ingrese el nombre completo"
                  />
                  {errors.nombreCompleto && <p className="text-sm text-red-500">{errors.nombreCompleto.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    {...register("fechaNacimiento", { required: "La fecha de nacimiento es requerida" })}
                  />
                  {errors.fechaNacimiento && <p className="text-sm text-red-500">{errors.fechaNacimiento.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genero">Género *</Label>
                  <Select onValueChange={(value) => setValue("genero", value as "M" | "F")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pais">País *</Label>
                  <Input
                    id="pais"
                    {...register("pais", { required: "El país es requerido" })}
                    placeholder="Ingrese el país"
                    defaultValue="Costa Rica"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="centroAsignado">Centro de Salud Asignado *</Label>
                  <Select onValueChange={(value) => setValue("centroAsignado", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un centro" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCenters.map((center) => (
                        <SelectItem key={center.id} value={center.name}>
                          {center.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección *</Label>
                <Textarea
                  id="direccion"
                  {...register("direccion", { required: "La dirección es requerida" })}
                  placeholder="Ingrese la dirección completa"
                  rows={3}
                />
                {errors.direccion && <p className="text-sm text-red-500">{errors.direccion.message}</p>}
              </div>
            </TabsContent>

            <TabsContent value="tutor1" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tutor1.nombre">Nombre del Tutor</Label>
                  <Input id="tutor1.nombre" {...register("tutor1.nombre")} placeholder="Nombre completo del tutor" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutor1.cedula">Cédula del Tutor</Label>
                  <Input id="tutor1.cedula" {...register("tutor1.cedula")} placeholder="Cédula del tutor" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutor1.telefono">Teléfono</Label>
                  <Input id="tutor1.telefono" {...register("tutor1.telefono")} placeholder="Número de teléfono" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutor1.email">Email</Label>
                  <Input
                    id="tutor1.email"
                    type="email"
                    {...register("tutor1.email")}
                    placeholder="Correo electrónico"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tutor1.direccion">Dirección del Tutor</Label>
                <Textarea
                  id="tutor1.direccion"
                  {...register("tutor1.direccion")}
                  placeholder="Dirección completa del tutor"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="tutor2" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tutor2.nombre">Nombre del Tutor 2</Label>
                  <Input id="tutor2.nombre" {...register("tutor2.nombre")} placeholder="Nombre completo del tutor" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutor2.cedula">Cédula del Tutor 2</Label>
                  <Input id="tutor2.cedula" {...register("tutor2.cedula")} placeholder="Cédula del tutor" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutor2.telefono">Teléfono</Label>
                  <Input id="tutor2.telefono" {...register("tutor2.telefono")} placeholder="Número de teléfono" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutor2.email">Email</Label>
                  <Input
                    id="tutor2.email"
                    type="email"
                    {...register("tutor2.email")}
                    placeholder="Correo electrónico"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tutor2.direccion">Dirección del Tutor 2</Label>
                <Textarea
                  id="tutor2.direccion"
                  {...register("tutor2.direccion")}
                  placeholder="Dirección completa del tutor"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{patient ? "Actualizar" : "Registrar"} Paciente</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
