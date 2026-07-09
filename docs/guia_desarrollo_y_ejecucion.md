# Guía de Desarrollo, Ejecución y Reglas Técnicas - Sistema Minimarket

Este documento sirve como la guía de ejecución local, mapa de ruta secuencial (backlog) y especificación de reglas críticas para la construcción o mantenimiento del Sistema Minimarket.

---

## 1. Guía de Ejecución Local (Paso a Paso)

Para ejecutar el sistema completo en un entorno de desarrollo local, siga estas instrucciones:

### Prerrequisitos:
* **.NET SDK 10.0** instalado.
* **Node.js** (versión 18 o superior).
* Servidor local de **SQL Server** en funcionamiento y configurado en `Minimarket.API/appsettings.json`.

### Paso 1: Levantar el Backend (API)
Abre una terminal en la raíz del proyecto y ejecuta:
```bash
dotnet run --project Minimarket.API/Minimarket.API.csproj
```
* **Acceso API:** La API compilará y se levantará en: `http://localhost:5288`.
* **Swagger/OpenAPI:** Puedes interactuar con la interfaz de Swagger entrando a: `http://localhost:5288/swagger`.

### Paso 2: Levantar el Frontend (UI)
Abre una segunda terminal en la carpeta `Minimarket.UI` y ejecuta:
```bash
npm install
npm run dev
```
* **Acceso Cliente:** Vite levantará el servidor de desarrollo en `http://localhost:5173`.

---

## 2. Plan de Construcción Secuencial (Ingeniería Inversa)

Si deseas reconstruir este sistema desde cero, el orden de construcción óptimo para evitar errores de compilación es el siguiente:

1. **`Minimarket.Domain`**: Modelar y crear las clases de entidades físicas puras (sin dependencias).
2. **`Minimarket.Application`**: Crear los contratos (interfaces) de servicios y definir los DTOs de entrada/salida para cortar referencias circulares en la serialización.
3. **`Minimarket.Infrastructure`**: Diseñar e inicializar el `DbContext` con Fluent API, implementar las migraciones, y escribir la lógica transaccional de los servicios (`VentasService`, `CajaService`, `InventarioService`, `CreditoService`).
4. **`Minimarket.API`**: Implementar los controladores REST expuestos a la web, configurar la serialización JSON global, el soporte de CORS y documentación OpenAPI.
5. **`Minimarket.Tests`**: Programar la suite de pruebas unitarias y de integración para validar la consistencia lógica de las ventas y cobros.
6. **`Minimarket.UI`**: Inicializar el cliente React con Vite y Material UI, configurando la URL dinámica en Axios y las redirecciones de rutas SPA (`vercel.json`).

---

## 3. Reglas Técnicas Críticas de Implementación

Para asegurar que cualquier Inteligencia Artificial o desarrollador replique el sistema con un 100% de precisión y libre de fallos comunes:

* **Object Cycles (Referencia Circular):** Nunca se deben retornar entidades puras de Entity Framework Core desde los endpoints de la API. Se debe proyectar siempre la consulta utilizando DTOs planos (`ProductoDTO`, `VentaDTO`) para evitar errores de serialización JSON infinita.
* **Transacciones ACID:** Los cobros y el descuento de existencias en bodega deben estar envueltos en un bloque transaccional utilizando `await _context.Database.BeginTransactionAsync()`. Si ocurre un fallo en el stock o en la pasarela de pagos, se debe hacer Rollback de inmediato.
* **Turno de Caja Requerido:** El terminal POS debe validar obligatoriamente que exista una sesión de caja activa (`montoCierreReal IS NULL`) antes de permitir facturar cualquier producto.
* **Arqueo y Cierre Dinámico:** El cierre de caja debe sumar en tiempo real el `montoApertura` más las ventas registradas con el método de pago `EFECTIVO` correspondientes a la sesión actual, ofreciendo al cajero un valor sugerido teórico automatizado para el arqueo.
