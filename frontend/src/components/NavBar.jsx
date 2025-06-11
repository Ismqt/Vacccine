import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          VaccineRD
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">Inicio</Button>
          <Button color="inherit" component={RouterLink} to="/dashboard">Panel</Button>
                    <Button color="inherit" component={RouterLink} to="/vaccines">Vacunas</Button>
          {isAuthenticated && user?.role === 'Administrador' && (
            <Button color="inherit" component={RouterLink} to="/users">Usuarios</Button>
          )}
        </Box>
        {isAuthenticated ? (
          <Button color="inherit" onClick={handleLogout}>Cerrar Sesión</Button>
        ) : (
          <Button color="inherit" component={RouterLink} to="/login">Iniciar Sesión</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
