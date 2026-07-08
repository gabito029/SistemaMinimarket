# Documentación Completa del Sistema de Gestión de Minimarket

Este documento describe a detalle la arquitectura, tecnologías, estructura del proyecto y funcionalidades del **Sistema de Gestión de Minimarket**.

---

## 🛠️ Arquitectura y Stack Tecnológico

El sistema adopta una arquitectura desacoplada estructurada en un **Backend (API REST)** y un **Frontend (Single Page Application - SPA)** respaldados por una base de datos relacional.

### 1. Backend (API REST)
* **Framework:** ASP.NET Core (en .NET 10).
* **ORM:** Entity Framework Core (EF Core) con SQL Server, permitiendo consultas tipadas y seguras.
* **Documentación:** NSwag/Swagger integrado para interactuar directamente con los endpoints desde `/swagger`.
* **Pruebas Unitarias:** xUnit, Moq y FluentAssertions para testing automatizado de los controladores y la lógica de negocio.

### 2. Frontend (Single Page Application)
* **Librería Principal:** React con TypeScript para código tipado y robusto.
* **Compilador/Servidor:** Vite para recarga en caliente instantánea y compilación optimizada.
* **Diseño e Interfaz:** Material UI (MUI) con un tema cálido personalizado y Tailwind CSS para posicionamiento dinámico y micro-animaciones.
* **Cliente HTTP:** Axios para el consumo asíncrono de los servicios del backend.

### 3. Base de Datos
* **Motor:** Microsoft SQL Server. Almacena las tablas de productos, categorías, ventas, detalles de venta, sesiones de caja, clientes, proveedores y usuarios.

---

## 📦 Estructura del Proyecto

La solución está organizada en múltiples capas lógicas para asegurar la escalabilidad y mantenibilidad del software:

```text
SISTEMA MINIMARKET/
│
├── Minimarket.Domain/           # Capa de Dominio: Entidades del modelo de datos de EF Core.
├── Minimarket.Application/      # Capa de Aplicación: Interfaces de servicios y DTOs de transferencia.
├── Minimarket.Infrastructure/   # Capa de Infraestructura: Contexto de datos (DbContext) e implementación de servicios.
├── Minimarket.API/              # Capa de API Web: Controladores REST, configuración CORS, serialización JSON y Program.cs.
├── Minimarket.Tests/            # Capa de Pruebas: Tests unitarios del backend agrupados por componente.
├── Minimarket.UI/               # Capa Frontend: Código fuente React, rutas, vistas, componentes e index.css.
└── SistemaMinimarket.slnx       # Archivo de solución XML.
```

---

## 🌟 Funcionalidades y Módulos del Sistema

El sistema cuenta con herramientas especializadas diseñadas para la operativa y administración diaria de una tienda:

### 1. Panel de Control (Dashboard)
* **Métricas Principales (KPIs):** Total de ventas del día, productos bajo stock y productos por vencer en los próximos 30 días.
* **Gráficas de Análisis:** Gráfico de área para la evolución temporal de ventas y gráfico de dona para el Top 10 de productos más vendidos.
* **Tablas de Alertas Tempranas:**
  - **Bajo Stock:** Muestra productos críticos que cuentan con menos de 15 unidades (con alertas visuales en rojo cuando quedan menos de 5 unidades).
  - **Por Vencer:** Muestra los productos próximos a caducar para retirarlos o ponerlos en oferta (resaltado en rojo si vencen en menos de 7 días).

### 2. Terminal de Ventas (POS)
* **Buscador Inteligente:** Permite agregar productos escribiendo partes del nombre o escaneando el código de barras con lector óptico.
* **Control de Stock y Caja:** Bloquea la adición al carrito si el producto no tiene existencias o si la sesión de caja no se encuentra abierta.
* **Liquidación Rápida:** Carrusel visual superior que sugiere productos próximos a vencer para ofrecerlos en liquidación directa con un clic.
* **Asociación de Clientes:** Selección opcional de un cliente registrado. Incluye un modal de **Registro Rápido** donde, si se digita un DNI/RUC ya existente en el sistema, este se autoselecciona automáticamente para evitar duplicados.
* **Múltiples Métodos de Pago:** Soporta Efectivo, Tarjeta de Crédito/Débito y Venta al Crédito.
* **Comprobante Inmediato:** Al completar la venta, se levanta un modal con el resumen detallado y un botón para **imprimir la boleta física** formateada para tiqueteras térmicas de 80mm.

### 3. Historial de Transacciones (Ventas)
* **Búsqueda y Filtros:** Permite filtrar transacciones por método de pago y por fechas específicas.
* **Detalle Histórico:** Tabla que muestra ID de boleta, fecha/hora, cliente, cajero vendedor, método de pago, estado de la transacción y monto cobrado.
* **Visor de Boletas:** Opciones para abrir el desglose de productos cobrados de cualquier venta histórica y reimprimir su boleta en cualquier momento.

### 4. Inventario y Productos
* **Gestión de Stock:** Catálogo para dar de alta nuevos productos ingresando código de barras, nombre, precio de costo (compra), precio de venta, stock actual, stock mínimo y fecha de vencimiento (opcional).
* **Control de Caducidad:** Registro y control de las fechas de vencimiento de lotes de mercadería.

### 5. Control de Caja (Shift Management)
* **Apertura de Turno:** Requiere ingresar el monto inicial de efectivo en caja.
* **Sugerencia de Cierre Automatizada:** Al momento de cerrar el turno, el sistema suma automáticamente el saldo inicial y las ventas realizadas en efectivo en el turno actual para sugerir el monto teórico que debe haber en caja física.
* **Reporte de Rendición de Cuentas:** Permite generar un reporte en PDF de auditoría detallando el balance de ingresos en efectivo, tarjeta, crédito y lista de boletas emitidas en la sesión actual, incluyendo líneas para firmas de conformidad del cajero y administrador.

### 6. Proveedores y Pedidos
* **Catálogo de Contacto:** Almacenamiento de información del proveedor, incluyendo nombre y número de contacto directo.
* **Control de Abastecimiento:** Pestaña dedicada a registrar y visualizar los pedidos realizados para restablecer el stock de los productos o registrar novedades recibidas.

### 7. Seguridad y Acceso
* **Autenticación:** Sistema de Login y cierre de sesión seguro para el personal.
* **Roles:** Diferenciación entre **Administrador** (acceso total a configuración, costos y reportes financieros) y **Cajero** (acceso enfocado a venta en el POS y apertura/cierre de su propia caja).

---

## 🚀 Guía de Ejecución Local

Para ejecutar el sistema en un entorno de desarrollo local, sigue estos pasos:

### Prerrequisitos
* Tener instalado [.NET SDK 10.0](https://dotnet.microsoft.com/download).
* Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).
* Tener acceso a una base de datos local o remota en **SQL Server** configurada en el archivo `Minimarket.API/appsettings.json`.

### Paso 1: Levantar el Backend (API)
Abre una terminal en la carpeta raíz del proyecto y ejecuta:
```bash
dotnet run --project Minimarket.API/Minimarket.API.csproj
```
La API compilará y se iniciará en: `http://localhost:5288`. Puedes acceder a Swagger desde: `http://localhost:5288/swagger`.

### Paso 2: Levantar el Frontend (UI)
Abre una segunda terminal en la carpeta `Minimarket.UI` y ejecuta:
```bash
npm install
npm run dev
```
Vite levantará el servidor de desarrollo en `http://localhost:5173` (o `http://localhost:5174` si el anterior está en uso).
