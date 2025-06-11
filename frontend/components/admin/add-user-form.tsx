"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApi } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"

interface Role {
  id_Rol: number
  Rol: string
}

interface AddUserFormProps {
  onSuccess: () => void
}

export function AddUserForm({ onSuccess }: AddUserFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm()
  const { data: roles, execute: fetchRoles } = useApi<Role[]>("/roles")
  const { execute: createUser, isLoading } = useApi("/users")
  const { toast } = useToast()

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const onSubmit = async (data: any) => {
    try {
      const payload = { ...data, id_Rol: Number(data.id_Rol) };
      await createUser({ method: "POST", body: JSON.stringify(payload) })
      toast({ title: "Success", description: "User created successfully." })
      onSuccess()
    } catch (error) {
      toast({ title: "Error", description: "Failed to create user.", variant: "destructive" })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="Email">Email</Label>
        <Input id="Email" type="email" {...register("Email", { required: true })} />
        {errors.Email && <p className="text-red-500">Email is required.</p>}
      </div>
      <div>
        <Label htmlFor="Clave">Password</Label>
        <Input id="Clave" type="password" {...register("Clave", { required: true })} />
        {errors.Clave && <p className="text-red-500">Password is required.</p>}
      </div>
      <div>
        <Label htmlFor="Cedula_Usuario">Cedula</Label>
        <Input id="Cedula_Usuario" type="text" {...register("Cedula_Usuario", { required: true })} />
        {errors.Cedula_Usuario && <p className="text-red-500">Cedula is required.</p>}
      </div>
      <div>
        <Label htmlFor="id_Rol">Role</Label>
        <Controller
          name="id_Rol"
          control={control}
          rules={{ required: "Role is required." }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role) => (
                  <SelectItem key={role.id_Rol} value={String(role.id_Rol)}>
                    {role.Rol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.id_Rol && <p className="text-red-500">{(errors.id_Rol.message as string)}</p>}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create User"}
      </Button>
    </form>
  )
}
