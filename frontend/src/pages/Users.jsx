import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../services/userService';

export default function Users() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      setLoading(true);
      getUsers(token)
        .then(setUsers)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setError('Debe iniciar sesión para ver los usuarios.');
      setLoading(false);
    }
  }, [token]);

  return (
    <Box sx={{ mt: 6, px: { xs: 1, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={600}>
          Gestión de Usuarios
        </Typography>
        <Button variant="contained" color="primary">
          Agregar Usuario
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      ) : (
        <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No se encontraron usuarios.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={user.id_Usuario}>
                      <TableCell>{user.Nombres ? `${user.Nombres} ${user.Apellidos}` : 'N/A'}</TableCell>
                      <TableCell>{user.Email}</TableCell>
                      <TableCell>{user.Rol}</TableCell>
                      <TableCell>{user.Estado}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
