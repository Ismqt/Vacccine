// src/services/vaccineService.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function getVaccines(token) {
  const res = await fetch(`${API_BASE}/vaccines`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error fetching vaccines');
  return await res.json();
}
