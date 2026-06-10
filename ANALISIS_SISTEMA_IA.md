# GUIA_EJECUCION_IA.md - Prompt de Planificación y Guía de Ejecución Paso a Paso para Construir el Sistema de Minimarket

Este archivo está redactado como una **guía maestra de desarrollo y prompt secuencial** para una Inteligencia Artificial. Simula que el sistema **aún no ha sido construido** y sirve como el mapa de ruta paso a paso (backlog) que debes seguir desde cero para implementarlo con éxito.

---

## 🎯 Objetivo del Proyecto
Construir un **Sistema de Gestión de Minimarket** con arquitectura limpia desacoplada (Backend API REST en .NET 10 y Frontend SPA en React con TypeScript). El sistema debe contar con un terminal de ventas (POS), alertas automáticas en un Dashboard y control de arqueo de caja.

---

## 🛠️ Stack Tecnológico Requerido
* **Backend:** C# (.NET 10.0), Entity Framework Core (EF Core), SQL Server, NSwag (Swagger).
* **Frontend:** React (v18+), TypeScript, Vite, Material UI (MUI v6), Tailwind CSS, Axios.
* **Testing:** xUnit, Moq, FluentAssertions en un proyecto de pruebas separado.

---

## 📐 Estructura de Capas a Crear
Debes crear una solución en C# con los siguientes proyectos:
1. `Minimarket.Domain`: Clases puras de base de datos (Entidades).
2. `Minimarket.Application`: Interfaces de servicios y DTOs planos.
3. `Minimarket.Infrastructure`: Implementación de lógica de datos y DbContext.
4. `Minimarket.API`: Controladores web, Program.cs y CORS.
5. `Minimarket.Tests`: Suite de pruebas unitarias.
6. `Minimarket.UI` (Carpeta SPA): Código de React y Vite.

---

## 🚀 Plan de Ejecución Secuencial (Paso a Paso)

Debes ejecutar la construcción en el siguiente orden estricto para evitar errores de compilación o de lógica:

### Fase 1: Base de Datos y Entidades de Dominio (`Minimarket.Domain`)
1. **Esquema de Base de Datos:** Diseña e inicializa las tablas en SQL Server:
   - `Usuario` (Id, Nombre, Username, Contrasena, Rol)
   - `Producto` (Id, CodigoBarras, Nombre, PrecioCosto, PrecioVenta, StockActual, StockMinimo, FechaVencimiento, CategoriaId)
   - `Cliente` (Id, Nombre, Documento, LimiteCredito, SaldoDeudor)
   - `SesionCaja` (Id, FechaApertura, MontoApertura, MontoCierreReal, UsuarioId)
   - `Venta` (Id, FechaHora, MetodoPago, Estado, Total, SesionCajaId, ClienteId)
   - `DetalleVenta` (VentaId, ProductoId, Cantidad, PrecioUnitario, Subtotal) ➔ Llave compuesta por VentaId y ProductoId.
2. **Entidades POCO:** Crea las clases de C# correspondientes a estas tablas dentro de `Minimarket.Domain/Entities/`.

### Fase 2: Definición de Contratos y DTOs (`Minimarket.Application`)
1. **Interfaces:** Define las interfaces de servicios en `Interfaces/`:
   - `IVentasService.cs` (métodos para registrar venta, obtener ventas e historial).
   - `IInventarioService.cs` (gestión de productos).
   - `ICajaService.cs` (apertura y cierre de turnos).
2. **DTOs de Entrada y Salida:** Crea clases planas en `DTOs/` para transportar datos:
   - `VentaCrearDTO.cs` y `DetalleVentaCrearDTO.cs` para recibir datos de compra.
   - `VentaDTO.cs` y DTOs anidados (`VentaClienteDTO`, `VentaSesionCajaDTO`, `VentaDetalleDTO`) para enviar información formateada al Frontend **sin incluir referencias circulares**.

### Fase 3: Persistencia y Lógica de Negocio (`Minimarket.Infrastructure`)
1. **DbContext:** Configura `DbMinimarketContext.cs` mapeando relaciones Fluent API y llaves compuestas.
2. **Implementación de Servicios:**
   - **`CajaService.cs`:** Lógica de apertura y cierre (guardando estado nulo en `MontoCierreReal` para identificar caja activa).
   - **`VentasService.cs`:** Lógica transaccional para `RegistrarVentaAsync`. Debe abrir una transacción, descontar stock en `Producto`, guardar cabecera y detalles, y hacer commit. Si el stock es insuficiente, debe disparar excepción y hacer rollback.

### Fase 4: Configuración de la API REST (`Minimarket.API`)
1. **Controladores:** Crea controladores para Caja, Inventario, Usuarios y Ventas exponiendo endpoints JSON.
2. **`Program.cs`:**
   - Registra inyección de dependencias para los servicios e infraestructura.
   - Configura la serialización para ignorar ciclos y propiedades nulas.
   - **CORS:** Permite accesos cruzados de orígenes dinámicos:
     `policy.WithOrigins("http://localhost:5173", "http://localhost:5174")`

### Fase 5: Suite de Pruebas Unitarias (`Minimarket.Tests`)
1. Crea tests unitarios con `xUnit` y `Moq` para validar que los controladores respondan `200 OK` en casos exitosos y `400 BadRequest` o `404 NotFound` en fallos.

### Fase 6: Construcción de la Interfaz Web (`Minimarket.UI`)
1. **Configuración de Vite:** Inicializa el proyecto React + TypeScript y configura Axios apuntando al puerto de la API.
2. **Diseño de Vistas (Warm Light):**
   - **`Login.tsx`:** Acceso para personal guardando el rol y sesión en local storage.
   - **`Dashboard.tsx`:** KPI de ventas del día, alertas de bajo stock (<15 unidades) y productos por vencer (<30 días) coloreados en rojo/ámbar.
   - **`PosDashboard.tsx` (Terminal POS):**
     - Exige caja activa antes de operar.
     - Carrito reactivo con buscador por texto o código de barras.
     - Registro rápido de clientes validando duplicidad por DNI/RUC.
     - Botón de cobro que, al ser exitoso, levante un modal detallado de la boleta y dispare la vista de impresión nativa para tiqueteras térmicas (80mm).
   - **`SalesDashboard.tsx`:** Historial de ventas con filtros de fecha/pago y reimpresión de comprobantes.
   - **`ProveedoresDashboard.tsx`:** Pestaña para administrar proveedores y registrar compras de stock.

---

## 🚨 Reglas Técnicas Críticas para la IA
1. **Object Cycles:** Bajo ninguna circunstancia serialices entidades del dominio directamente. Proyecta siempre tus consultas de EF Core hacia DTOs planos.
2. **Transacciones ACID:** Los cobros y descuentos de existencias deben envolverse en un bloque `BeginTransactionAsync()`.
3. **CORS:** Asegura soporte en la API para los puertos `5173` y `5174` del cliente dev.
4. **Cierre de Caja:** El arqueo debe calcular un sugerido teórico de forma dinámica basado en efectivo inicial y ventas en cash del turno.
