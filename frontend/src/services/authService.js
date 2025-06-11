// src/services/authService.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al iniciar sesión.' }));
    throw new Error(errorData.message || 'Credenciales inválidas.');
  }

  return await response.json();
}
