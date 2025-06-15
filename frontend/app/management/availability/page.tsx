"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvailabilityForm } from '@/components/availability/availability-form';
import { AppointmentsManagementTable } from '@/components/availability/appointments-management-table';
import { useToast } from '@/components/ui/use-toast';
import { InventoryTabContent } from '@/components/inventory/inventory-tab-content';

const AvailabilityManagementPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && user && ![1, 6].includes(user.id_Rol)) {
      toast({ variant: 'destructive', title: 'Acceso Denegado', description: 'No tienes permiso para ver esta página.' });
      router.push('/dashboard');
    }
  }, [user, isAuthenticated, loading, router, toast]);

  if (loading || !isAuthenticated || !user) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  const handleFormSubmit = () => {
    // This is a placeholder to trigger a re-render or data fetch in the table if needed.
    // For now, the table re-fetches on its own, but this is good practice.
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Panel de Gestión del Centro</h1>
        <p className="text-muted-foreground">Administra la disponibilidad de citas y el registro de vacunaciones.</p>
      </header>

      <Tabs defaultValue="availability" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="availability">Gestión de Disponibilidad</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
        </TabsList>
        <TabsContent value="availability">
          <div className="mt-4">
            <h1 className="text-2xl font-bold mb-4">Gestión de Disponibilidad y Citas</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <AvailabilityForm onFormSubmit={handleFormSubmit} />
              </div>
              <div className="md:col-span-2">
                <AppointmentsManagementTable onDataRefresh={handleFormSubmit} />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="inventory">
          <div className="mt-4">
            <h1 className="text-2xl font-bold mb-4">Gestión de Inventario de Vacunas</h1>
            <InventoryTabContent />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AvailabilityManagementPage;
