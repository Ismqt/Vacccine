'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock types - replace with actual types
interface Appointment {
  id_Cita: number;
  FechaCita: string;
  HoraCita: string;
  NombrePaciente: string;
  EstadoCita: string;
  NombreCentro: string;
}

interface Status {
  id_EstadoCita: number;
  NombreEstado: string;
}

interface Lote {
  id_Lote: number;
  NumeroLote: string;
}

const DOCTOR_ROLE_ID = 2; // Adjust if the doctor role ID is different

export default function DoctorDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedLote, setSelectedLote] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const api = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.id_Rol !== DOCTOR_ROLE_ID)) {
      router.push('/login');
    }
  }, [user, loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [appRes, statusRes, loteRes] = await Promise.all([
            fetch(`${api}/doctor/appointments`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            fetch(`${api}/doctor/statuses`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            fetch(`${api}/doctor/lots`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
          ]);

          setAppointments(await appRes.json());
          setStatuses(await statusRes.json());
          setLotes(await loteRes.json());
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch dashboard data.' });
        }
      };
      fetchData();
    }
  }, [user, api, toast]);

  const handleUpdateClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedStatus('');
    setSelectedLote('');
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !selectedStatus) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a new status.' });
      return;
    }

    try {
      const response = await fetch(`${api}/doctor/appointments/${selectedAppointment.id_Cita}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          id_EstadoCita: parseInt(selectedStatus, 10),
          id_Lote: selectedLote ? parseInt(selectedLote, 10) : null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update appointment.');
      }

      toast({ title: 'Success', description: data.message });
      setIsDialogOpen(false);
      // Refresh appointments list
      const appRes = await fetch(`${api}/doctor/appointments`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      setAppointments(await appRes.json());

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    }
  };

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((app) => (
                <TableRow key={app.id_Cita}>
                  <TableCell>{app.NombrePaciente}</TableCell>
                  <TableCell>{new Date(app.FechaCita).toLocaleDateString()}</TableCell>
                  <TableCell>{app.HoraCita}</TableCell>
                  <TableCell>{app.EstadoCita}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleUpdateClick(app)}>Update Status</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Appointment for {selectedAppointment?.NombrePaciente}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="status-select">New Status</label>
              <Select onValueChange={setSelectedStatus} value={selectedStatus}>
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.id_EstadoCita} value={status.id_EstadoCita.toString()}>
                      {status.NombreEstado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="lote-select">Vaccine Lot (if applicable)</label>
              <Select onValueChange={setSelectedLote} value={selectedLote}>
                <SelectTrigger id="lote-select">
                  <SelectValue placeholder="Select a lot" />
                </SelectTrigger>
                <SelectContent>
                  {lotes.map((lote) => (
                    <SelectItem key={lote.id_Lote} value={lote.id_Lote.toString()}>
                      {lote.NumeroLote}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Update Appointment</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
