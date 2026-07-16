# Configuración de Frontend y Rutas - Sistema Minimarket

Este documento describe la arquitectura, rutas, almacenamiento de estado y configuración del cliente en React (TypeScript) expuesto en la carpeta `Minimarket.UI`.

---

## 1. Stack Tecnológico y Configuración

* **Framework:** React + TypeScript + Vite.
* **Componentes Visuales:** Material UI (MUI).
* **Consumo de API:** Axios (configurado con una dirección base dinámica mediante variables de entorno).

### **Dirección Base Dinámica (`src/services/api.ts`):**
El cliente lee el endpoint del backend dinámicamente. Si se despliega en producción, utiliza la variable `VITE_API_URL` provista por el hosting (Vercel); de lo contrario, apunta a `localhost`:
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5288/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## 2. Control de Acceso y Estado de Autenticación

El sistema no utiliza tokens JWT complejos (diseño educativo simple). La sesión se controla guardando el objeto del usuario directamente en el almacenamiento local del navegador (`localStorage`).

### **Estructura Guardada en Login (`auth_user`):**
```json
{
  "id": 1,
  "nombre": "Gabriela Admin",
  "username": "gabrielaa",
  "rol": "Administrador"
}
```

### **Lógica de Redirección según Roles (`src/pages/Login.tsx`):**
Al iniciar sesión, el sistema evalúa la propiedad `rol` para decidir a qué panel enviar al usuario:
* **Cajero:** Redirige al terminal POS: `navigate('/pos')`.
* **Administrador:** Redirige al inventario: `navigate('/dashboard')`.

---

## 3. Rutas y Páginas Disponibles

El enrutamiento está gestionado por `react-router-dom`.

| Ruta | Componente | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `/` | `Login.tsx` | Público | Pantalla de inicio de sesión. |
| `/inventario` | `InventoryDashboard.tsx` | Administrador | Tabla de productos con buscador, filtros y CRUD. |
| `/pos` | `PosDashboard.tsx` | Ambos Roles | Terminal de cobro rápido, carrito, clientes y caja. |
| `/usuarios` | `UsuariosDashboard.tsx` | Administrador | Listado y registro de cajeros/administradores. |
| `/proveedores`| `ProveedoresDashboard.tsx`| Administrador | Gestión de compras a proveedores y cuentas por pagar. |

---

## 4. Configuración para el Despliegue (SPA Redirects)

Dado que React es una SPA (Single Page Application), al desplegarse en servidores en la nube como Vercel, cualquier refresco directo a una ruta secundaria (como `/inventario`) arroja un error **404 NOT FOUND** si el servidor intenta buscar el archivo físico.

Para resolver esto, se incluye un archivo de redirecciones en la raíz del frontend:

### **`Minimarket.UI/vercel.json`**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
* **Efecto:** Le dice a Vercel que todas las rutas HTTP solicitadas deben servir el archivo base `index.html` para que el enrutador de React pueda tomar el control e interpretar la URL correspondiente de manera interna.
