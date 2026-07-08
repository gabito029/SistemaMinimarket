# Estructura de Pruebas de Integración con TestContainers

```
PruebrasIntegracion/
├── Fixtures/
│   └── SqlServerContainerFixture.cs
│       ├── Inicia un contenedor SQL Server 2022
│       ├── Crea DbContext con EntityFrameworkCore
│       ├── Ejecuta migraciones automáticamente
│       └── Limpia recursos después de cada prueba
│
├── Integration/
│   └── InventarioIntegrationTests.cs
│       ├── Test 1: CrearProducto_DebeGuardarEnBaseDatos
│       │   ├── Crea una categoría
│       │   ├── Crea un producto
│       │   ├── Verifica la persistencia en BD
│       │   └── Recupera el producto y valida datos
│       │
│       ├── Test 2: ObtenerProductos_DebeRetornarTodosLosProductosGuardados
│       │   ├── Crea una categoría
│       │   ├── Inserta 2 productos
│       │   ├── Obtiene todos los productos
│       │   └── Verifica que existan ambos
│       │
│       └── Test 3: ActualizarStock_DebeModificarLaCantidadCorrectamente
│           ├── Crea una categoría y un producto
│           ├── Ajusta el stock (+10 unidades)
│           ├── Recupera el producto actualizado
│           └── Verifica que el stock se incrementó correctamente
│
├── PruebrasIntegracion.csproj
│   └── Dependencias:
│       ├── Testcontainers 4.2.0
│       ├── Testcontainers.MsSql 4.2.0
│       ├── Microsoft.EntityFrameworkCore.SqlServer 10.0.8
│       ├── FluentAssertions 8.10.0
│       ├── xUnit 2.9.3
│       └── xUnit.runner.visualstudio 3.1.4
│
└── README.md
	└── Instrucciones y solución de problemas
```

## Flujo de Ejecución de una Prueba

```
1. Fixture se inicializa (IAsyncLifetime.InitializeAsync)
   ├─ Descarga imagen SQL Server 2022 (primera vez)
   ├─ Inicia el contenedor
   ├─ Crea cadena de conexión dinámicamente
   ├─ Configura DbContext con la conexión real
   └─ Ejecuta migraciones (crea tablas)

2. Se ejecuta el método de prueba
   ├─ Arrange: Prepara datos (categoría, producto)
   ├─ Act: Ejecuta operación (crear, obtener, actualizar)
   └─ Assert: Verifica resultados con FluentAssertions

3. Fixture se limpia (IAsyncLifetime.DisposeAsync)
   ├─ Cierra DbContext
   ├─ Detiene el contenedor
   └─ Libera recursos
```

## Integración con Entity Framework

Las pruebas utilizan el **DbMinimarketContext** real con una conexión a SQL Server en contenedor:

```csharp
// Configuración en SqlServerContainerFixture
var connectionString = _container.GetConnectionString(); // Conexión dinámica
var options = new DbContextOptionsBuilder<DbMinimarketContext>()
	.UseSqlServer(connectionString)
	.Options;

DbContext = new DbMinimarketContext(options);
await DbContext.Database.MigrateAsync(); // Crea tablas automáticamente
```

## Ventajas de TestContainers

✅ **Aislamiento completo**: Cada prueba tiene su propia BD  
✅ **Base de datos real**: No usa BD en memoria, pruebas más confiables  
✅ **Reproducibilidad**: Mismo entorno que producción  
✅ **Automatización**: No requiere instalación manual de BD  
✅ **Limpieza automática**: Sin datos residuales entre pruebas  

## Próximas Mejoras Sugeridas

1. Agregar pruebas para CreditosController
2. Agregar pruebas para VentasController
3. Implementar fixtures compartidas (base de datos compartida entre pruebas)
4. Agregar pruebas de rendimiento con carga
5. Integrar con CI/CD (GitHub Actions, Azure DevOps)
