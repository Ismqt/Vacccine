"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Calendar } from "lucide-react"

export default function RegisterChildPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    id_Tutor: "",
    Nombres: "",
    Apellidos: "",
    Genero: "",
    CodigoIdentificacionPropio: "",
    FechaNacimiento: "",
    PaisNacimiento: "República Dominicana",
  })

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (user.role !== "Tutor") {
        router.push("/dashboard")
        toast({
          variant: "destructive",
          title: "Acceso denegado",
          description: "Solo los tutores pueden registrar niños",
        })
      } else {
        // Set the tutor ID from the logged-in user
        setFormData((prev) => ({ ...prev, id_Tutor: user.id.toString() }))
      }
    }
  }, [user, loading, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const token = localStorage.getItem("token")

      const childData = {
        ...formData,
        id_Tutor: Number.parseInt(formData.id_Tutor),
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ninos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(childData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al registrar niño")
      }

      toast({
        title: "Registro exitoso",
        description: "El niño ha sido registrado correctamente",
      })

      router.push("/children")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: error instanceof Error ? error.message : "Error al registrar niño",
      })
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl font-bold">Cargando...</div>
          <p className="text-muted-foreground">Por favor espere</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Card className="mx-auto w-full max-w-lg">
        <CardHeader>
          <CardTitle>Registrar Niño</CardTitle>
          <CardDescription>Complete el formulario para registrar un niño bajo su tutela</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="Nombres">Nombres</Label>
                <Input id="Nombres" name="Nombres" value={formData.Nombres} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Apellidos">Apellidos</Label>
                <Input id="Apellidos" name="Apellidos" value={formData.Apellidos} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="Genero">Género</Label>
              <Select onValueChange={(value) => handleSelectChange("Genero", value)} required>
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
              <Label htmlFor="CodigoIdentificacionPropio">Código de Identificación</Label>
              <Input
                id="CodigoIdentificacionPropio"
                name="CodigoIdentificacionPropio"
                value={formData.CodigoIdentificacionPropio}
                onChange={handleChange}
                placeholder="Número de identificación o pasaporte"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="FechaNacimiento">Fecha de Nacimiento</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="FechaNacimiento"
                  name="FechaNacimiento"
                  type="date"
                  className="pl-10"
                  value={formData.FechaNacimiento}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="PaisNacimiento">País de Nacimiento</Label>
              <Input
                id="PaisNacimiento"
                name="PaisNacimiento"
                value={formData.PaisNacimiento}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar Niño"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
