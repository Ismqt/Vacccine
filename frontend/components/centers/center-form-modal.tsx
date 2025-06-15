"use client"

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useApi from "@/hooks/use-api";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// Interfaces for API data
interface Province {
  id_Provincia: number;
  Nombre: string;
}

interface Municipality {
  id_Municipio: number;
  Nombre: string;
}

interface CenterStatus {
  id_Estado: number;
  NombreEstado: string;
}

// Zod schema for form validation, aligned with backend
const formSchema = z.object({
  Nombre: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  Director: z.string().min(3, { message: "El nombre del director es requerido." }).optional().or(z.literal('')), 
  Direccion: z.string().min(5, { message: "La dirección es requerida." }),
  id_Provincia: z.coerce.number().positive({ message: "Debe seleccionar una provincia." }),
  id_Municipio: z.coerce.number().positive({ message: "Debe seleccionar un municipio." }),
  Telefono: z.string().min(8, { message: "El teléfono debe ser válido." }).optional().or(z.literal('')), 
  URLGoogleMaps: z.string().url({ message: "Debe ser una URL válida." }).optional().or(z.literal('')), 
  Capacidad: z.coerce.number().int().positive({ message: "La capacidad debe ser un número positivo." }),
  id_Estado: z.coerce.number().positive({ message: "Debe seleccionar un estado." }),
});

const defaultValues = {
  Nombre: "",
  Director: "",
  Direccion: "",
  URLGoogleMaps: "",
  Telefono: "",
  Capacidad: 100,
  id_Provincia: 0,
  id_Municipio: 0,
  id_Estado: 0,
};

interface CenterFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  center: any | null; // Using 'any' for flexibility with incoming data structure
  onFormSubmit: () => void; // Callback to refresh data
}

export const CenterFormModal = ({ open, onOpenChange, center, onFormSubmit }: CenterFormModalProps) => {
  const { toast } = useToast();
  const { token } = useAuth();
  const isEditing = !!center;

  // State for dropdown data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [statuses, setStatuses] = useState<CenterStatus[]>([]);

  // API hooks
  const { request: fetchData } = useApi();
  const { request: submitForm, loading: isSubmitting } = useApi();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const getMunicipalities = useCallback(async (provinceId: number) => {
    if (!provinceId) return;
    try {
      const data = await fetchData(`/api/locations/municipalities/${provinceId}`);
      setMunicipalities(data || []);
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al cargar municipios' });
      return [];
    }
  }, [fetchData, toast]);

  // Fetch initial data for dropdowns
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const provincesData = await fetchData('/api/locations/provinces');
        setProvinces(provincesData || []);

        const statusesData = await fetchData('/api/vaccination-centers/statuses');
        setStatuses(statusesData || []);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error al cargar datos iniciales' });
      }
    };

    if (open) {
      loadInitialData();
    }
  }, [open, fetchData, toast]);

  // Populate form when editing
  useEffect(() => {
    if (isEditing && center && provinces.length > 0 && statuses.length > 0) {
      form.reset(defaultValues); // Reset to defaults before populating
      const province = provinces.find(p => p.Nombre === center.Provincia);
      if (province) {
        form.setValue('id_Provincia', province.id_Provincia);
        getMunicipalities(province.id_Provincia).then((munis: Municipality[]) => {
          const municipality = munis.find((m: Municipality) => m.Nombre === center.Municipio);
          if (municipality) {
            form.setValue('id_Municipio', municipality.id_Municipio);
          }
        });
      }

      const status = statuses.find(s => s.NombreEstado === center.Estado);
      if (status) {
        form.setValue('id_Estado', status.id_Estado);
      }

      // Set remaining fields
      form.setValue('Nombre', center.Nombre);
      form.setValue('Director', center.Director);
      form.setValue('Direccion', center.Direccion);
      form.setValue('URLGoogleMaps', center.URLGoogleMaps);
      form.setValue('Telefono', center.Telefono);
      form.setValue('Capacidad', center.Capacidad);

    } else {
      form.reset(defaultValues);
    }
  }, [center, isEditing, form, provinces, statuses, getMunicipalities]);

  // Handle province change to fetch municipalities
  const handleProvinceChange = (provinceId: number) => {
    form.setValue('id_Municipio', 0); // Reset municipality selection
    setMunicipalities([]);
    getMunicipalities(provinceId);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const endpoint = isEditing ? `/api/vaccination-centers/${center.id_CentroVacunacion}` : '/api/vaccination-centers';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      await submitForm(endpoint, { method, body: values });
      toast({ title: `Centro ${isEditing ? 'actualizado' : 'creado'} con éxito` });
      onFormSubmit();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error al guardar el centro', description: err.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Centro de Vacunación" : "Crear Nuevo Centro"}</DialogTitle>
          <DialogDescription>{isEditing ? "Actualiza la información del centro." : "Completa el formulario para añadir un nuevo centro."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="Nombre" render={({ field }) => (<FormItem><FormLabel>Nombre del Centro</FormLabel><FormControl><Input placeholder="Ej: Centro de Salud Metropolitano" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="Director" render={({ field }) => (<FormItem><FormLabel>Director</FormLabel><FormControl><Input placeholder="Ej: Dr. Juan Pérez" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="Direccion" render={({ field }) => (<FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Ej: Av. Central, Calle 5" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="id_Provincia" render={({ field }) => (<FormItem><FormLabel>Provincia</FormLabel><Select onValueChange={(value) => { field.onChange(Number(value)); handleProvinceChange(Number(value)); }} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione una provincia" /></SelectTrigger></FormControl><SelectContent>{provinces.map(p => <SelectItem key={p.id_Provincia} value={String(p.id_Provincia)}>{p.Nombre}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="id_Municipio" render={({ field }) => (<FormItem><FormLabel>Municipio</FormLabel><Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)} disabled={!form.watch('id_Provincia') || municipalities.length === 0}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione un municipio" /></SelectTrigger></FormControl><SelectContent>{municipalities.map(m => <SelectItem key={m.id_Municipio} value={String(m.id_Municipio)}>{m.Nombre}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="Telefono" render={({ field }) => (<FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="Ej: 809-555-1234" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="URLGoogleMaps" render={({ field }) => (<FormItem><FormLabel>URL de Google Maps</FormLabel><FormControl><Input placeholder="https://maps.app.goo.gl/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="Capacidad" render={({ field }) => (<FormItem><FormLabel>Capacidad</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="id_Estado" render={({ field }) => (<FormItem><FormLabel>Estado</FormLabel><Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione un estado" /></SelectTrigger></FormControl><SelectContent>{statuses.map(s => <SelectItem key={s.id_Estado} value={String(s.id_Estado)}>{s.NombreEstado}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isEditing ? "Guardar Cambios" : "Crear Centro"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
