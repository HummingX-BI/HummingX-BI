import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =========================================================================
// MODO OFFLINE / DEMO (Railway vencido)
// =========================================================================
// api.defaults.adapter = async (config) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       let mockData = {};
//       const url = config.url;
//       const method = config.method;
//       
//       if (url.includes('/auth/login')) {
//         const body = JSON.parse(config.data);
//         const isAdmin = body.email.toLowerCase().includes('admin');
//         mockData = {
//           token: 'demo-token-123',
//           user: { id: 'demo1', name: isAdmin ? 'Admin Demo' : 'Cliente Demo', email: body.email, role: isAdmin ? 'admin' : 'client' }
//         };
//       } else if (url.includes('/auth/me')) {
//         const stored = localStorage.getItem('hx_user');
//         mockData = stored ? JSON.parse(stored) : { id: 'demo1', name: 'Demo User', email: 'demo@hummingxbi.com', role: 'client' };
//       } else if (url.includes('/projects/my')) {
//         mockData = [{
//           id: 'proj1', name: 'Página Web + Menú Digital', description: 'Proyecto de demostración offline para HummingX BI.',
//           currentPhase: 3, progressPercent: 65, estimatedDelivery: '2024-11-20T00:00:00.000Z', status: 'active',
//           quoteLink: 'https://docs.google.com/document/d/demo-quote',
//           contractLink: '' // Dejamos este vacío para que el cliente vea el estado "Pendiente"
//         }];
//       } else if (url.match(/\/admin\/clients$/)) {
//         mockData = [
//           { id: 'c1', name: 'Juan Pérez', companyName: 'Tahara Café', email: 'contacto@tahara.com', role: 'client', active: true, projects: [{ name: 'Menú Digital', currentPhase: 3, progressPercent: 75, status: 'active' }] },
//           { id: 'c2', name: 'Ana Silva', companyName: 'Zentric', email: 'hola@zentric.com', role: 'client', active: true, projects: [{ name: 'Portal Interno', currentPhase: 1, progressPercent: 10, status: 'active' }] },
//         ];
//       } else if (url.match(/\/admin\/clients\//)) {
//         mockData = { 
//           id: 'c1', name: 'Juan Pérez', companyName: 'Tahara Café', email: 'contacto@tahara.com', phone: '5512345678', role: 'client', active: true,
//           projects: [{ id: 'p1', name: 'Menú Digital', description: 'Proyecto demo.', currentPhase: 3, progressPercent: 75, status: 'active', quoteLink: 'https://demo.com', contractLink: '', activities: [{ id: 'a1', description: 'Avance registrado en modo offline.', createdAt: new Date().toISOString() }] }],
//           creditMovements: [{ amount: 500, type: 'welcome_bonus', createdAt: new Date().toISOString() }]
//         };
//       }
// 
//       // Si es una petición PUT o POST en admin (guardar cambios), solo devolver success
//       if (method === 'put' || method === 'post') {
//         if (!url.includes('/auth/login')) {
//           mockData = config.data ? JSON.parse(config.data) : { success: true };
//         }
//       }
// 
//       resolve({
//         data: mockData,
//         status: 200,
//         statusText: 'OK',
//         headers: {},
//         config,
//         request: {}
//       });
//     }, 400); // Simulamos retraso de red
//   });
// };

export default api;
