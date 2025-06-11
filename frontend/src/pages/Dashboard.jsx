import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { People, LocalHospital, EventNote, Business } from '@mui/icons-material';
import { fetchDashboardStats } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon, title, value, color }) => (
  <Card elevation={3} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
    <Box sx={{ mr: 2, color: color }}>{icon}</Box>
    <Box>
      <Typography variant="h4" fontWeight={700}>{value}</Typography>
      <Typography color="text.secondary">{title}</Typography>
    </Box>
  </Card>
);

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchDashboardStats(token)
        .then(setStats)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setError('Debe iniciar sesión para ver el panel.');
      setLoading(false);
    }
  }, [token]);

  return (
    <Box sx={{ mt: 6, px: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Panel Principal
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Estadísticas del sistema en tiempo real
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      ) : stats && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard icon={<People fontSize="large" />} title="Usuarios Registrados" value={stats.TotalUsers} color="#1976d2" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard icon={<LocalHospital fontSize="large" />} title="Vacunas Disponibles" value={stats.TotalVaccines} color="#d32f2f" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard icon={<Business fontSize="large" />} title="Centros de Vacunación" value={stats.TotalCenters} color="#388e3c" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard icon={<EventNote fontSize="large" />} title="Citas Programadas" value={stats.TotalScheduledAppointments} color="#f57c00" />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
