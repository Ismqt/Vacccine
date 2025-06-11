// src/services/userService.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function getUsers(token) {
  const response = await fetch(`${API_BASE}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('No tiene permiso para ver esta información.');
    }
    throw new Error('Error al cargar la lista de usuarios.');
  }

  return await response.json();
}
