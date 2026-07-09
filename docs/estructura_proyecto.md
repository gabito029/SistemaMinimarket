# Mapa de Estructura de Archivos del Proyecto - Sistema Minimarket

Este documento detalla el mapa físico del proyecto ubicado en la ruta raíz `C:\Users\ASUS\Downloads\SISTEMA MINIMARKET\SISTEMA MINIMARKET\SISTEMA MINIMARKET`. Describe la jerarquía de archivos y el propósito exacto de cada componente para proporcionar una guía de navegación del código fuente.

---

## 1. Vista de Carpetas y Estructura Principal

El repositorio está organizado en proyectos de backend .NET Core (usando la arquitectura de capas), el proyecto de frontend en React y los proyectos de pruebas automatizadas:

```
C:\Users\ASUS\Downloads\SISTEMA MINIMARKET\SISTEMA MINIMARKET\SISTEMA MINIMARKET
├── docs/                        # Documentación técnica del sistema
├── Minimarket.Domain/           # Capa de Dominio (Entidades de BD)
├── Minimarket.Application/      # Capa de Aplicación (Interfaces y DTOs)
├── Minimarket.Infrastructure/   # Capa de Infraestructura (Base de datos y lógica)
├── Minimarket.API/              # Capa de Presentación (Controladores y Endpoints)
├── Minimarket.UI/               # Proyecto de Frontend (React + Vite)
├── PruebrasIntegracion/         # Pruebas de integración con Docker (Testcontainers)
├── Minimarket.Tests/            # Pruebas unitarias básicas
├── Minimarket.Pruebas.Tests/    # Pruebas de controladores y servicios
├── SistemaMinimarket.slnx       # Archivo de solución unificado de Visual Studio
├── solution.runsettings         # Configuración del motor de pruebas y cobertura
└── docker-compose.yml           # Orquestación de contenedores Docker
```

---

## 2. Detalle de Proyectos de Backend

### 🌐 Minimarket.API (Servidor Web y Ruteo)
Es el proyecto de inicio del backend que expone los endpoints HTTP.
* 📂 **`Controllers/`**: Controladores que reciben las peticiones del Frontend:
  * 📄 `UsuariosController.cs`: Maneja inicios de sesión (`/login`), creación y listado de usuarios.
  * 📄 `InventarioController.cs`: Administra el catálogo de productos y el ajuste de stock.
  * 📄 `VentasController.cs`: Registra transacciones y cobros.
  * 📄 `CajaController.cs`: Gestiona la apertura y cierre de turnos de caja.
  * 📄 `CreditosController.cs`: Controla el saldo deudor de clientes y abonos.
  * 📄 `DashboardController.cs`: Obtiene el consolidado financiero para los gráficos.
* 📄 **`Program.cs`**: Punto de entrada de la aplicación. Configura la inyección de dependencias, base de datos SQL Server, política de CORS abierta y documentación NSwag/Swagger.
* 📄 **`Dockerfile`**: Configuración para la compilación y empaquetado del contenedor Docker.
* 📄 **`appsettings.json`**: Contiene configuraciones de configuración local (cadenas de conexión).

---

### 💾 Minimarket.Infrastructure (Acceso a Datos y Lógica)
Contiene las implementaciones técnicas de base de datos y la lógica principal.
* 📂 **`Data/`**:
  * 📄 `DbMinimarketContext.cs`: Contexto de Entity Framework Core. Mapea mediante Fluent API las tablas reales de SQL Server en español y define las relaciones relacionales de llaves foráneas.
* 📂 **`Services/`**: Contienen las implementaciones de las reglas de negocio:
  * 📄 `InventarioService.cs`: Controla productos y emite códigos automatizados `PROD-XXXX` si se omiten.
  * 📄 `VentasService.cs`: Controla las ventas disminuyendo existencias y sumando deudas si es fiado.
  * 📄 `CajaService.cs`: Registra los montos iniciales y finales de la caja.
  * 📄 `CreditoService.cs`: Mide la amortización y control de saldos sobre los créditos.

---

### ⚙️ Minimarket.Application (Definiciones y Contratos)
Define la estructura intermedia del proyecto.
* 📂 **`Interfaces/`**: Interfaces de servicios que desacoplan el controlador de la infraestructura (ej: `IVentasService.cs`, `IInventarioService.cs`).
* 📂 **`DTOs/`**: Estructuras planas de transporte de información para los controladores (ej: `VentaCrearDTO.cs`, `ProductoDTO.cs`).

---

### 📦 Minimarket.Domain (Entidades del Negocio)
La capa central y pura de la arquitectura.
* 📂 **`Entities/`**: Clases de C# que representan las tablas físicas de la base de datos:
  * 📄 `Producto.cs`, `Categorium.cs`, `Cliente.cs`, `Usuario.cs`, `SesionCaja.cs`, `Venta.cs`, `DetalleVentum.cs`, `CreditoCliente.cs`, `AbonoCliente.cs`, `AjusteStock.cs`, `Proveedor.cs`, `Compra.cs`, `DetalleCompra.cs`, `CuentaPorPagar.cs`, `LogAuditorium.cs`, `ComprobantePago.cs`.

---

## 3. Detalle del Proyecto de Frontend (`Minimarket.UI`)

Desarrollado en React, TypeScript y empaquetado mediante Vite.

* 📂 **`src/`**: Carpeta principal del código fuente.
  * 📂 **`components/`**: Componentes reutilizables.
    * 📄 `Navigation.tsx`: Barra superior y navegación del panel administrador y cajero.
  * 📂 **`pages/`**: Vistas completas del sistema:
    * 📄 `Login.tsx`: Formulario de acceso con control de redirecciones por rol.
    * 📂 `Inventario/`:
      * 📄 `InventoryDashboard.tsx`: Panel principal de catálogo con el buscador por nombre/código de barras, filtro de categorías, filtro de productos críticos de bajo stock, y el CRUD de artículos.
      * 📄 `ProveedoresDashboard.tsx`: Módulo para registrar compras externas y pagar cuentas.
    * 📂 `POS/`:
      * 📄 `PosDashboard.tsx`: Pantalla de venta rápida para el cajero. Incluye el carrito de compras, asociación de clientes fiados, impresión de tickets y reportes de cierre de turno en PDF.
    * 📂 `Usuarios/`:
      * 📄 `UsuariosDashboard.tsx`: Panel para que el Administrador registre nuevos cajeros.
  * 📂 **`services/`**:
    * 📄 `api.ts`: Configuración del cliente HTTP Axios. Utiliza la variable `VITE_API_URL` para conectarse a la API en la nube (Render) o de forma local.
* 📄 **`index.html`**: Estructura base del cliente.
* 📄 **`package.json`**: Manifiesto de dependencias npm (React, Material UI, Axios).
* 📄 **`vercel.json`**: Configuración de redirecciones SPA para evitar errores 404 en el servidor de Vercel.

---

## 4. Detalle de Proyectos de Pruebas Automatizadas

* 📂 **`Minimarket.Tests`**: Contiene pruebas unitarias de controladores.
* 📂 **`Minimarket.Pruebas.Tests`**: Pruebas unitarias avanzadas enfocadas en validar la lógica lógica de servicios como `InventarioService` y `VentasService`.
* 📂 **`PruebrasIntegracion`**: Suite avanzada de pruebas de integración que despliega bases de datos temporales SQL Server en contenedores de Docker (usando Testcontainers) para simular el comportamiento real del sistema de créditos y ventas.
