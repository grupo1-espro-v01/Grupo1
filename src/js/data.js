// ─── USUARIOS DEL SISTEMA ───────────────────────────────────────────────────
const USERS = [
  { id: 1, user: 'admin',         pass: 'admin123',   rol: 'admin',         nombre: 'Administrador Principal' },
  { id: 2, user: 'recepcion',     pass: 'recep123',   rol: 'recepcion',     nombre: 'Fiscal Auxiliar' },
  { id: 3, user: 'investigador1', pass: 'invest123',  rol: 'investigador',  nombre: 'Juan Investigador' },
];

// ─── DATOS INICIALES ─────────────────────────────────────────────────────────
const DENUNCIAS_INICIALES = [
  {
    codigo: 'DEN-2026-001',
    fiscal: 'recepcion',
    denunciante: 'Juan Pérez',
    dui: '01234567-8',
    correo: 'juan@email.com',
    telefono: '7111-2222',
    descripcion: 'Corrupción en licitación pública en alcaldía municipal',
    categoria: 'Corrupción / Fraude',
    gravedad: 'alta',
    estado: 'En Investigación',
    anonima: false,
    investigador: 'investigador1',
    evidencias: 3,
    fecha: '2026-04-15',
  },
  {
    codigo: 'DEN-2026-002',
    fiscal: 'recepcion',
    denunciante: 'María López',
    dui: '09876543-2',
    correo: 'maria@email.com',
    telefono: '7333-4444',
    descripcion: 'Malversación de fondos en institución educativa pública',
    categoria: 'Corrupción / Fraude',
    gravedad: 'alta',
    estado: 'Asignada',
    anonima: false,
    investigador: 'investigador1',
    evidencias: 5,
    fecha: '2026-04-16',
  },
  {
    codigo: 'DEN-2026-003',
    fiscal: 'recepcion',
    denunciante: 'ANÓNIMO',
    dui: '',
    correo: '',
    telefono: '',
    descripcion: 'Abuso de autoridad por parte de funcionario público',
    categoria: 'Derechos Humanos',
    gravedad: 'media',
    estado: 'Nueva',
    anonima: true,
    investigador: null,
    evidencias: 2,
    fecha: '2026-04-17',
  },
  {
    codigo: 'DEN-2026-004',
    fiscal: 'recepcion',
    denunciante: 'Carlos Ruiz',
    dui: '05555555-1',
    correo: 'carlos@email.com',
    telefono: '7555-6666',
    descripcion: 'Acoso laboral por parte de supervisor en institución pública',
    categoria: 'Laboral',
    gravedad: 'media',
    estado: 'Nueva',
    anonima: false,
    investigador: null,
    evidencias: 1,
    fecha: '2026-04-18',
  },
  {
    codigo: 'DEN-2026-005',
    fiscal: 'recepcion',
    denunciante: 'Ana Martínez',
    dui: '06666666-3',
    correo: 'ana@email.com',
    telefono: '7777-8888',
    descripcion: 'Violencia intrafamiliar con evidencia fotográfica',
    categoria: 'Familiar / Violencia',
    gravedad: 'alta',
    estado: 'Resuelta',
    anonima: false,
    investigador: 'investigador1',
    evidencias: 6,
    fecha: '2026-04-10',
  },
];

const LOGS_INICIALES = [
  { fecha: '2026-04-18 10:30', usuario: 'admin',      accion: 'Login',       detalle: 'Inicio de sesión exitoso' },
  { fecha: '2026-04-18 09:45', usuario: 'recepcion',  accion: 'Registro',    detalle: 'Denuncia DEN-2026-003 registrada' },
  { fecha: '2026-04-18 08:20', usuario: 'admin',      accion: 'Asignación',  detalle: 'DEN-2026-001 asignada a investigador1' },
  { fecha: '2026-04-17 16:10', usuario: 'recepcion',  accion: 'Evidencia',   detalle: '3 archivos adjuntados a DEN-2026-002' },
  { fecha: '2026-04-17 14:05', usuario: 'investigador1', accion: 'Estado',   detalle: 'DEN-2026-001 → En Investigación' },
  { fecha: '2026-04-16 11:30', usuario: 'admin',      accion: 'Login',       detalle: 'Inicio de sesión exitoso' },
  { fecha: '2026-04-15 09:00', usuario: 'recepcion',  accion: 'Registro',    detalle: 'Denuncia DEN-2026-001 registrada' },
];

// ─── ESTADO GLOBAL (en memoria, persiste con sessionStorage) ─────────────────
window.DB = {
  // Carga desde sessionStorage si existe, sino usa los iniciales
  get denuncias() {
    const raw = sessionStorage.getItem('denuncias');
    return raw ? JSON.parse(raw) : [...DENUNCIAS_INICIALES];
  },
  set denuncias(v) {
    sessionStorage.setItem('denuncias', JSON.stringify(v));
  },
  get logs() {
    const raw = sessionStorage.getItem('logs');
    return raw ? JSON.parse(raw) : [...LOGS_INICIALES];
  },
  set logs(v) {
    sessionStorage.setItem('logs', JSON.stringify(v));
  },
};

// Inicializa si es la primera vez
if (!sessionStorage.getItem('denuncias')) {
  window.DB.denuncias = [...DENUNCIAS_INICIALES];
}
if (!sessionStorage.getItem('logs')) {
  window.DB.logs = [...LOGS_INICIALES];
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
window.Auth = {
  login(usuario, password) {
    const u = USERS.find(x => x.user === usuario && x.pass === password);
    if (u) {
      sessionStorage.setItem('currentUser', JSON.stringify(u));
      return u;
    }
    return null;
  },
  logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  },
  currentUser() {
    const raw = sessionStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  },
  requireLogin(rolesPermitidos = []) {
    const u = this.currentUser();
    if (!u) { window.location.href = 'index.html'; return null; }
    if (rolesPermitidos.length && !rolesPermitidos.includes(u.rol)) {
      alert('Acceso denegado: no tiene permisos para esta sección.');
      window.location.href = 'index.html';
      return null;
    }
    return u;
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
window.Utils = {
  nextCodigo() {
    const lista = window.DB.denuncias;
    const num = lista.length + 1;
    return `DEN-2026-${String(num).padStart(3, '0')}`;
  },
  fechaHora() {
    return new Date().toISOString().slice(0, 16).replace('T', ' ');
  },
  addLog(usuario, accion, detalle) {
    const logs = window.DB.logs;
    logs.unshift({ fecha: this.fechaHora(), usuario, accion, detalle });
    window.DB.logs = logs;
  },
  estadoBadge(estado) {
    const map = {
      'Nueva':           'badge-nueva',
      'Asignada':        'badge-investigacion',
      'En Investigación':'badge-investigacion',
      'Resuelta':        'badge-resuelta',
      'Archivada':       'badge-archivada',
    };
    return `<span class="badge ${map[estado] || 'badge-nueva'}">${estado}</span>`;
  },
  gravedad(g) {
    const map = { alta: '🔴 Alta', media: '🟡 Media', baja: '🟢 Baja' };
    return map[g] || g;
  },
};
