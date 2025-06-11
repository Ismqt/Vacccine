"use client"

import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface CenterFormData {
  name: string
  address: string
  phone: string
  email: string
  director: string
  capacity: number
  status: "active" | "maintenance" | "inactive"
  coordinates?: {
    lat: number
    lng: number
  }
}

interface CenterFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  center?: any
}

export function CenterFormModal({ open, onOpenChange, center }: CenterFormModalProps) {
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<CenterFormData>({
    defaultValues: center || {
      status: "active",
    },
  })

  const onSubmit = (data: CenterFormData) => {
    try {
      console.log("Center data:", data)

      toast({
        title: center ? "Centro actualizado" : "Centro creado",
        description: `El centro ha sido ${center ? "actualizado" : "creado"} exitosamente.`,
      })

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{center ? "Editar Centro" : "Crear Nuevo Centro"}</DialogTitle>
          <DialogDescription>Complete la información del centro de vacunación</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Centro *</Label>
              <Input
                id="name"
                {...register("name", { required: "El nombre es requerido" })}
                placeholder="Nombre del centro"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="director">Director *</Label>
              <Input
                id="director"
                {...register("director", { required: "El director es requerido" })}
                placeholder="Nombre del director"
              />
              {errors.director && <p className="text-sm text-red-500">{errors.director.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                {...register("phone", { required: "El teléfono es requerido" })}
                placeholder="Número de teléfono"
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: "El email es requerido" })}
                placeholder="Correo electrónico"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad *</Label>
              <Input
                id="capacity"
                type="number"
                {...register("capacity", {
                  required: "La capacidad es requerida",
                  min: { value: 1, message: "La capacidad debe ser mayor a 0" },
                })}
                placeholder="Número máximo de pacientes"
              />
              {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select onValueChange={(value) => setValue("status", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección *</Label>
            <Textarea
              id="address"
              {...register("address", { required: "La dirección es requerida" })}
              placeholder="Dirección completa del centro"
              rows={3}
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{center ? "Actualizar" : "Crear"} Centro</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
