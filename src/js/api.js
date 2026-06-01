const API_URL = 'http://localhost:3000/api';

const Auth = {
  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
    return data;
  },
  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    window.location.href = 'index.html';
  },
  currentUser() {
    const u = sessionStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  },
  token() {
    return sessionStorage.getItem('token');
  },
  requireLogin(rolesPermitidos = []) {
    const u = this.currentUser();
    if (!u) { window.location.href = 'index.html'; return null; }
    if (rolesPermitidos.length && !rolesPermitidos.includes(u.rol)) {
      alert('Acceso denegado.');
      window.location.href = 'index.html';
      return null;
    }
    return u;
  }
};

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${Auth.token()}`
});

const get = async (endpoint) => {
  const res = await fetch(`${API_URL}${endpoint}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

const post = async (endpoint, body) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

const patch = async (endpoint, body) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

const postForm = async (endpoint, formData) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Auth.token()}` },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

const Denuncias = {
  listar: (params = '') => get(`/denuncias${params}`),
  registrar: (body) => post('/denuncias', body),
  consultarPublico: (codigo) => get(`/denuncias/consulta/${codigo}`),
  cambiarEstado: (id, estado) => patch(`/denuncias/${id}/estado`, { estado }),
  asignar: (id, investigador_id) => post(`/denuncias/${id}/asignar`, { investigador_id }),
};

const Evidencias = {
  subir: (denuncia_id, formData) => postForm(`/evidencias/${denuncia_id}`, formData),
  listar: (denuncia_id) => get(`/evidencias/${denuncia_id}`),
};

const Usuarios = {
  listar: () => get('/usuarios'),
  crear: (body) => post('/usuarios', body),
  cambiarEstado: (id, activo) => patch(`/usuarios/${id}/estado`, { activo }),
};

const Reportes = {
  dashboard: () => get('/reportes/dashboard'),
  exportar: () => get('/reportes/exportar'),
};

const Auditoria = {
  listar: () => get('/auditoria'),
};

const Investigadores = {
  listar: () => get('/investigadores'),
};

const Utils = {
  estadoBadge(estado) {
    const map = {
      'Nueva': 'badge-nueva',
      'Asignada': 'badge-investigacion',
      'En Investigacion': 'badge-investigacion',
      'Resuelta': 'badge-resuelta',
      'Archivada': 'badge-archivada',
    };
    return `<span class="badge ${map[estado] || 'badge-nueva'}">${estado}</span>`;
  },
  gravedad(g) {
    const map = { alta: '🔴 Alta', media: '🟡 Media', baja: '🟢 Baja' };
    return map[g] || g;
  },
  formatFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-SV');
  }
};

// Exponer globalmente
window.Auth = Auth;
window.Denuncias = Denuncias;
window.Evidencias = Evidencias;
window.Usuarios = Usuarios;
window.Reportes = Reportes;
window.Auditoria = Auditoria;
window.Investigadores = Investigadores;
window.Utils = Utils;