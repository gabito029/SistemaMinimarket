import axios from 'axios';

// Instancia de axios configurada con la URL base del Backend
const api = axios.create({
  baseURL: 'http://localhost:5288/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProductos = async () => {
  const response = await api.get('/Inventario/productos');
  return response.data;
};

export const getCajaActiva = async () => {
  const response = await api.get('/Caja/activa');
  return response.data;
};

export const registrarVenta = async (ventaData: any) => {
  const response = await api.post('/Ventas', ventaData);
  return response.data;
};

export const crearProducto = async (productoData: any) => {
  const response = await api.post('/Inventario/productos', productoData);
  return response.data;
};

export const getCategorias = async () => {
  const response = await api.get('/Inventario/categorias');
  return response.data;
};

export const crearCategoria = async (categoriaData: any) => {
  const response = await api.post('/Inventario/categorias', categoriaData);
  return response.data;
};

export const getUsuarios = async () => {
  const response = await api.get('/Usuarios');
  return response.data;
};

export const crearUsuario = async (usuarioData: any) => {
  const response = await api.post('/Usuarios', usuarioData);
  return response.data;
};

export const actualizarUsuario = async (id: number, usuarioData: any) => {
  const response = await api.put(`/Usuarios/${id}`, usuarioData);
  return response.data;
};

export const eliminarUsuario = async (id: number) => {
  const response = await api.delete(`/Usuarios/${id}`);
  return response.data;
};

export const actualizarProducto = async (id: number, productoData: any) => {
  const response = await api.put(`/Inventario/productos/${id}`, productoData);
  return response.data;
};

export const eliminarProducto = async (id: number) => {
  const response = await api.delete(`/Inventario/productos/${id}`);
  return response.data;
};

export const getVentas = async () => {
  const response = await api.get('/Ventas');
  return response.data;
};

export const abrirCaja = async (montoApertura: number, usuarioId?: number) => {
  const response = await api.post('/Caja/abrir', { montoApertura, usuarioId });
  return response.data;
};

export const cerrarCaja = async (id: number, montoCierreReal: number) => {
  const response = await api.post(`/Caja/cerrar/${id}`, { montoCierreReal });
  return response.data;
};

export const getProveedores = async () => {
  const response = await api.get('/Proveedores');
  return response.data;
};

export const registrarCompra = async (compraData: any) => {
  const response = await api.post('/Proveedores', compraData);
  return response.data;
};

export const loginUsuario = async (username: string, contrasena: string) => {
  const response = await api.post('/Usuarios/login', { username, contrasena });
  return response.data;
};

export const getDashboardResumen = async () => {
  const response = await api.get('/Dashboard/resumen');
  return response.data;
};

export const aplicarOfertasVencimiento = async () => {
  const response = await api.post('/Dashboard/aplicar-ofertas-vencimiento');
  return response.data;
};

export default api;
