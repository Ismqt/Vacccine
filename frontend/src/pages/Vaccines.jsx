import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import { getVaccines } from '../services/vaccineService';

export default function Vaccines() {
  const { token } = useAuth();
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      setLoading(true);
      getVaccines(token)
        .then(setVaccines)
        .catch(err => setError('No se pudieron cargar las vacunas. Intente de nuevo más tarde.'))
        .finally(() => setLoading(false));
    } else {
      setError('Debe iniciar sesión para ver las vacunas.');
      setLoading(false);
    }
  }, [token]);

  return (
    <Box sx={{ mt: 6, px: { xs: 1, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Catálogo de Vacunas
      </Typography>
      <Button variant="contained" sx={{ mb: 2 }}>
        Nueva Vacuna
      </Button>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Nombre</b></TableCell>
                <TableCell><b>Fabricante</b></TableCell>
                <TableCell><b>Dosis</b></TableCell>
                <TableCell align="right"><b>Acciones</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vaccines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No hay vacunas registradas.</TableCell>
                </TableRow>
              ) : vaccines.map((vac) => (
                <TableRow key={vac.id_Vacuna} hover>
                  <TableCell>{vac.Nombre}</TableCell>
                  <TableCell>{vac.NombreFabricante || '-'}</TableCell>
                  <TableCell>{vac.Dosis || '-'}</TableCell>
                  <TableCell align="right">
                    <Button size="small">Ver</Button>
                    <Button size="small" color="primary">Editar</Button>
                    <Button size="small" color="error">Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
