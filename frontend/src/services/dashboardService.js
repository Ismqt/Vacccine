// src/services/dashboardService.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function fetchDashboardStats(token) {
  const res = await fetch(`${API_BASE}/dashboard/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    if (res.status === 403) throw new Error('No tiene permiso para ver esta información.');
    throw new Error('Error al cargar las estadísticas del panel.');
  }
  return await res.json();
}
