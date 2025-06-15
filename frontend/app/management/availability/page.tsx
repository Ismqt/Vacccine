"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { AvailabilityForm } from '@/components/availability/availability-form';
import { AppointmentsManagementTable } from '@/components/availability/appointments-management-table';
import { useToast } from '@/components/ui/use-toast';

const AvailabilityManagementPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && user && !['Administrador', 'Personal del Centro de Vacunación'].includes(user.role)) {
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
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Panel de Gestión del Centro</h1>
        <p className="text-muted-foreground">Administra la disponibilidad de citas y el registro de vacunaciones.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Agregar Disponibilidad</h2>
          <AvailabilityForm onFormSubmit={handleFormSubmit} />
        </div>
        <div className="lg:col-span-2">
          <AppointmentsManagementTable onDataRefresh={handleFormSubmit} />
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManagementPage;
