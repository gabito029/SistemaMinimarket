# 🛒 Sistema de Gestión de Minimarket

¡Bienvenido al **Sistema de Gestión de Minimarket**! Una solución web moderna y de nivel profesional diseñada para optimizar las operaciones diarias de una tienda de abarrotes. El sistema cuenta con control de inventarios, alertas inteligentes de caducidad y stock mínimo, y un terminal de ventas (POS) con soporte para arqueos de caja y ventas al crédito (fiados).

---

## 🚀 Enlaces de Despliegue en la Nube (100% Online)

El sistema se encuentra completamente publicado en internet de forma gratuita a través de los siguientes servicios:

* **Página Web (Frontend en Vercel):** [https://sistema-minimarket-eta.vercel.app](https://sistema-minimarket-eta.vercel.app)
* **Servidor de API (Backend en Render):** [https://minimarket-api-co8l.onrender.com/swagger](https://minimarket-api-co8l.onrender.com/swagger)
* **Base de Datos (SQL Server en Somee):** Host de base de datos activa `DBMinimarket.mssql.somee.com`.

### 🔑 Credenciales de Acceso de Demostración:
* **Rol Administrador:** Usuario: `gabrielaa` | Contraseña: `admin123`
* **Rol Cajero de Turno:** Usuario: `carlosff` | Contraseña: `cajero123`

---

## 🌟 Módulos Principales del Sistema

1. **Panel de Control (Dashboard):** Métricas clave de ventas, gráficos interactivos de rendimiento financiero, Top 10 de productos más vendidos y bandejas de alerta temprana para stock crítico (<15 unidades) y vencimiento de productos (<30 días).
2. **Terminal de Ventas (POS):** Carrito interactivo de compra rápida con buscador por texto o código de barras, carrusel de liquidaciones rápidas (productos sugeridos por vencer) y soporte para facturar en efectivo, tarjeta o crédito.
3. **Turnos y Arqueo de Caja:** Control estricto de apertura y cierre de caja. El sistema sugiere el arqueo teórico sumando de forma automática el efectivo inicial y las ventas cobradas en cash. Permite generar la rendición de cuentas final en PDF con firmas de conformidad.
4. **Clientes y Crédito (Fiados):** Registro de clientes con límites de crédito asignados, control de saldos deudores acumulados y registro de amortizaciones/abonos sobre créditos pendientes.
5. **Proveedores y Compras:** Catálogo de proveedores asociados, registro de compras externas para reponer stock y control de cuentas por pagar.

---

## 🛠️ Arquitectura y Stack Tecnológico

El proyecto está diseñado bajo buenas prácticas de ingeniería de software empleando una **Arquitectura Desacoplada** en capas:

* **Capa de Negocio (Backend):** Desarrollado en **C# (.NET Core 10.0)** implementando **Arquitectura Limpia (Clean Architecture)**:
  * `Minimarket.Domain`: Entidades puras de datos.
  * `Minimarket.Application`: Interfaces de servicios y DTOs de transferencia.
  * `Minimarket.Infrastructure`: Contexto de Entity Framework Core y lógica transaccional de negocio.
  * `Minimarket.API`: Endpoints REST expuestos con documentación interactiva Swagger.
* **Capa de Cliente (Frontend):** Desarrollado en **React (TypeScript) + Vite**, Material UI (MUI) para un diseño de interfaz premium y Axios para solicitudes HTTP dinámicas.
* **Base de Datos:** **Microsoft SQL Server** en la nube.

---

## 📂 Guía de Carpetas y Documentación Técnica

Toda la especificación técnica profunda del sistema se encuentra organizada dentro de la carpeta **[`/docs`](file:///C:/Users/ASUS/Downloads/SISTEMA%20MINIMARKET/SISTEMA%20MINIMARKET/SISTEMA%20MINIMARKET/docs)** en tu repositorio:

* **[arquitectura.md](file:///C:/Users/ASUS/Downloads/SISTEMA%20MINIMARKET/SISTEMA%20MINIMARKET/SISTEMA%20MINIMARKET/docs/arquitectura.md):** Esquema relacional DDL de la Base de Datos y diseño de capas del backend.
* **[endpoints_api.md](file:///C:/Users/ASUS/Downloads/SISTEMA%20MINIMARKET/SISTEMA%20MINIMARKET/SISTEMA%20MINIMARKET/docs/endpoints_api.md):** Contratos JSON de entrada y salida para cada endpoint de la API.
* **[frontend_routing.md](file:///C:/Users/ASUS/Downloads/SISTEMA%20MINIMARKET/SISTEMA%20MINIMARKET/SISTEMA%20MINIMARKET/docs/frontend_routing.md):** Manejo de rutas, roles y configuraciones de redirección SPA en Vercel.
* **[estructura_proyecto.md](file:///C:/Users/ASUS/Downloads/SISTEMA%20MINIMARKET/SISTEMA%20MINIMARKET/SISTEMA%20MINIMARKET/docs/estructura_proyecto.md):** Mapa físico del árbol de directorios y archivos de la solución local.
* **[guia_desarrollo_y_ejecucion.md](file:///C:/Users/ASUS/Downloads/SISTEMA%20MINIMARKET/SISTEMA%20MINIMARKET/SISTEMA%20MINIMARKET/docs/guia_desarrollo_y_ejecucion.md):** Instrucciones de inicio local y reglas de negocio críticas (ACID, CORS).

---

## 💻 Instrucciones Rápidas para Ejecutar en Local

Si deseas correr el sistema en tu computadora de forma local:

1. **Backend (API):**
   ```bash
   dotnet run --project Minimarket.API/Minimarket.API.csproj
   ```
   *Acceso Swagger:* `http://localhost:5288/swagger`

2. **Frontend (Vite):**
   ```bash
   cd Minimarket.UI
   npm install
   npm run dev
   ```
   *Acceso:* `http://localhost:5173`
