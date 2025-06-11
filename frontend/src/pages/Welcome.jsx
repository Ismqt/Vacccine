import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Box>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Bienvenido a VaccineRD
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Sistema de Gestión de Vacunación Seguro y Moderno
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
          Administre usuarios, vacunas, centros y citas con seguridad y eficiencia. Inicie sesión para comenzar o explore el sistema.
        </Typography>
        <Button variant="contained" size="large" sx={{ mr: 2 }} onClick={() => navigate('/dashboard')}>
          Iniciar Sesión
        </Button>
        <Button variant="outlined" size="large" onClick={() => navigate('/vaccines')}>
          Explorar Vacunas
        </Button>
      </Box>
    </Container>
  );
}
