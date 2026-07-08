# Pruebas de Integración con TestContainers

Este proyecto contiene pruebas de integración que utilizan **TestContainers** para ejecutar una instancia de SQL Server en un contenedor Docker.

## Requisitos Previos

Antes de ejecutar las pruebas, asegúrate de tener instalado:

1. **Docker Desktop** - Descargalo desde [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. **.NET 10 SDK** - Ya instalado en tu sistema
3. **Visual Studio Community 2026** - Ya instalado

## Configuración Inicial

### 1. Inicia Docker Desktop

- En Windows: Abre Docker Desktop desde el menú Inicio
- Espera a que aparezca "Docker is running" en la bandeja del sistema

### 2. Verifica que Docker está funcionando

Abre PowerShell y ejecuta:

```powershell
docker --version
docker run hello-world
```

## Estructura de las Pruebas

El proyecto `PruebrasIntegracion` contiene:

### Fixture
- **`Fixtures/SqlServerContainerFixture.cs`**: Configura un contenedor SQL Server automáticamente
  - Crea la instancia del contenedor
  - Ejecuta las migraciones de Entity Framework
  - Limpia los recursos después de cada prueba

### Pruebas de Integración
- **`Integration/InventarioIntegrationTests.cs`**: 3 pruebas de integración para el módulo de Inventario
  1. **CrearProducto_DebeGuardarEnBaseDatos** - Verifica que un producto se persiste correctamente en BD
  2. **ObtenerProductos_DebeRetornarTodosLosProductosGuardados** - Verifica que se recuperan todos los productos
  3. **ActualizarStock_DebeModificarLaCantidadCorrectamente** - Verifica el ajuste de stock

## Ejecución de las Pruebas

### Opción 1: Desde Visual Studio

1. Asegúrate de que Docker Desktop está ejecutándose
2. Abre el **Test Explorer** (Ctrl+E, T)
3. Busca "PruebrasIntegracion"
4. Haz clic en **"Run All"** (Ejecutar todas)

### Opción 2: Desde PowerShell

```powershell
cd "C:\Users\ASUS\Downloads\SISTEMA MINIMARKET\SISTEMA MINIMARKET\SISTEMA MINIMARKET"
dotnet test PruebrasIntegracion/PruebrasIntegracion.csproj -v normal
```

## Características Clave

✅ **TestContainers Automático**: Los contenedores se crean y destruyen automáticamente  
✅ **Aislamiento de Pruebas**: Cada prueba tiene su propio contexto BD limpio  
✅ **Base de Datos Real**: Usa SQL Server 2022 (no BD en memoria)  
✅ **Migraciones Automáticas**: Crea las tablas automáticamente  
✅ **Assertions Fluidas**: Usa FluentAssertions para mayor claridad  

## Solución de Problemas

### Error: "Docker is either not running or misconfigured"

**Causa**: Docker Desktop no está ejecutándose

**Solución**:
1. Abre Docker Desktop
2. Espera a que muestre "Docker is running"
3. Ejecuta nuevamente las pruebas

### Error: "Docker daemon not responding"

**Solución**:
1. Cierra Docker Desktop completamente
2. Abre PowerShell como Administrador
3. Ejecuta: `docker system prune -a --volumes`
4. Reinicia Docker Desktop
5. Intenta nuevamente

### Las pruebas son lentas

Esto es normal. TestContainers debe:
- Descargar la imagen de SQL Server (primera vez: ~3-5 min)
- Iniciar el contenedor (~5-10 segundos)
- Ejecutar migraciones (~2-3 segundos)

Ejecuciones posteriores serán más rápidas.

## Paquetes Utilizados

- **Testcontainers** (4.2.0) - Orquestación de contenedores
- **Testcontainers.MsSql** (4.2.0) - Contenedor SQL Server
- **FluentAssertions** (8.10.0) - Assertions más legibles
- **Microsoft.EntityFrameworkCore.SqlServer** (10.0.8) - EF para SQL Server
- **xUnit** (2.9.3) - Framework de testing

## Referencias

- [Testcontainers.DotNet Documentation](https://dotnet.testcontainers.org/)
- [FluentAssertions Documentation](https://fluentassertions.com/)
- [xUnit Documentation](https://xunit.net/)
