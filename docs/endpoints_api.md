# Especificación de Endpoints de la API - Sistema Minimarket

Este documento define la estructura y contratos de los endpoints expuestos por la API del backend (`Minimarket.API`), facilitando su replicación e integración.

---

## 1. Módulo de Usuarios y Autenticación (`/api/Usuarios`)

Maneja el control de accesos y administración de cuentas. Las contraseñas se almacenan y comparan en texto plano (diseño simplificado).

### **Iniciar Sesión (Login)**
* **Endpoint:** `POST /api/Usuarios/login`
* **Content-Type:** `application/json`
* **Request Body:**
```json
{
  "username": "gabrielaa",
  "contrasena": "admin123"
}
```
* **Response (200 OK):**
```json
{
  "id": 1,
  "nombre": "Gabriela Admin",
  "username": "gabrielaa",
  "rol": "Administrador"
}
```
* **Response (401 Unauthorized):**
`"Usuario o contraseña incorrectos"`

### **Obtener Todos los Usuarios**
* **Endpoint:** `GET /api/Usuarios`
* **Response (200 OK):**
```json
[
  {
    "id": 1,
    "nombre": "Gabriela Admin",
    "username": "gabrielaa",
    "rol": "Administrador"
  }
]
```

### **Crear Usuario**
* **Endpoint:** `POST /api/Usuarios`
* **Request Body:**
```json
{
  "nombre": "Carlos Cajero",
  "username": "carlosff",
  "contrasena": "cajero123",
  "rol": "Cajero"
}
```
* **Response (201 Created):** Retorna el objeto creado con su ID.

---

## 2. Módulo de Inventario (`/api/Inventario`)

Administra productos, categorías y ajustes manuales de stock.

### **Obtener Productos**
* **Endpoint:** `GET /api/Inventario/productos`
* **Response (200 OK):**
```json
[
  {
    "id": 1,
    "codigoBarras": "PROD-0001",
    "nombre": "Aceite Primor Premium 1L",
    "precioCosto": 7.20,
    "precioVenta": 9.50,
    "stockActual": 45,
    "stockMinimo": 10,
    "fechaVencimiento": "2027-12-31T00:00:00",
    "categoriaId": 1
  }
]
```

### **Crear Producto (Con Autogeneración de ID)**
* **Endpoint:** `POST /api/Inventario/productos`
* **Lógica Interna:** Si `codigoBarras` se envía vacío o nulo, el backend le asigna automáticamente la nomenclatura `"PROD-" + ID` rellenado a 4 dígitos (ej: `PROD-0010`).
* **Request Body:**
```json
{
  "codigoBarras": "",
  "nombre": "Jamón de Pavo 150g",
  "precioCosto": 5.50,
  "precioVenta": 8.00,
  "stockActual": 20,
  "stockMinimo": 5,
  "categoriaId": 2,
  "fechaVencimiento": "2026-08-30"
}
```
* **Response (201 Created):** Retorna el producto con su código autogenerado.

### **Ajuste Manual de Stock**
* **Endpoint:** `POST /api/Inventario/productos/{id}/ajuste-stock`
* **Request Body:**
```json
{
  "cantidad": 5,
  "tipoAjuste": "Ingreso", // Valores: 'Ingreso', 'Salida'
  "justificacion": "Reposición de almacén"
}
```
* **Response (200 OK):** Registra el cambio en `AjusteStock` y actualiza la columna `stockActual` en `Producto`.

---

## 3. Módulo del Terminal de Ventas (POS) (`/api/Ventas`)

Registra transacciones y actualiza inventarios.

### **Registrar una Venta**
* **Endpoint:** `POST /api/Ventas`
* **Lógica Interna:** Resta el stock en `Producto`. Si el método de pago es `CREDITO` y se provee `clienteId`, crea un registro en `CreditoCliente` y suma el `saldoDeudor` en la tabla `Cliente`.
* **Request Body:**
```json
{
  "sesionCajaId": 1,
  "clienteId": null, // ID del cliente si es crédito o venta asociada
  "metodoPago": "EFECTIVO", // Valores: 'EFECTIVO', 'TARJETA', 'CREDITO'
  "detalles": [
    {
      "productoId": 1,
      "cantidad": 2
    }
  ]
}
```
* **Response (200 OK):** Retorna el comprobante con los detalles guardados.

---

## 4. Control de Turnos de Caja (`/api/Caja`)

Garantiza que solo se puedan registrar ventas si existe un turno abierto.

### **Verificar Caja Activa**
* **Endpoint:** `GET /api/Caja/activa`
* **Response (200 OK):** Retorna la sesión de caja si `montoCierreReal` es `null`.
* **Response (404 Not Found):** Si no hay caja abierta en la tienda.

### **Abrir Caja**
* **Endpoint:** `POST /api/Caja/abrir`
* **Request Body:**
```json
{
  "montoApertura": 150.00,
  "usuarioId": 1
}
```

### **Cerrar Caja**
* **Endpoint:** `POST /api/Caja/cerrar/{id}`
* **Request Body:**
```json
{
  "montoCierreReal": 245.50
}
```
