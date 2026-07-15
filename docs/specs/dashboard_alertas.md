# Especificación de Dashboard y Alertas

## Propósito
Proporcionar a los administradores métricas clave de ventas en tiempo real y alertas tempranas sobre productos que están cerca de vencer o agotando su stock disponible.

## Requerimientos

### Requerimiento: Alertas de Stock Crítico
El sistema DEBE detectar e identificar productos cuyo stock actual esté por debajo de un umbral crítico.
El umbral por defecto para stock crítico DEBERÁ ser menor a 15 unidades.
Los productos identificados DEBEN ser visibles en el panel de advertencias del Dashboard.

#### Escenario: El producto es marcado por bajo stock
- **DADO** un producto con un stock de 16 unidades
- **CUANDO** se completa una venta de 2 unidades, reduciendo el stock a 14 unidades
- **ENTONCES** el producto DEBERÁ aparecer en el panel de alertas de stock crítico

---

### Requerimiento: Alertas de Vencimiento de Productos
El sistema DEBE detectar e identificar productos cuya fecha de caducidad se esté aproximando.
El umbral por defecto para la alerta temprana de vencimiento DEBERÁ ser menor a 30 días restantes.
El sistema DEBERÁ listar estos productos en el Dashboard para que los operadores prioricen su liquidación o venta rápida.

#### Escenario: El producto es marcado por vencimiento cercano
- **DADO** un producto con una fecha de vencimiento establecida a 25 días a partir de hoy
- **CUANDO** el dashboard recupera las alertas activas
- **ENTONCES** el producto DEBERÁ listarse en el panel de alertas de vencimiento

---

### Requerimiento: Métricas del Dashboard de Ventas
El sistema DEBE calcular las cifras totales de ventas diarias, semanales o mensuales.
El sistema DEBERÁ identificar el Top 10 de productos más vendidos según la cantidad total de unidades vendidas.
Los gráficos del dashboard DEBEN renderizarse dinámicamente basándose en los datos históricos de transacciones.

#### Escenario: Actualización del Top 10 de productos
- **DADO** múltiples transacciones de ventas registradas a lo largo del mes
- **CUANDO** se carga la página del dashboard
- **ENTONCES** el sistema DEBERÁ calcular la suma de las cantidades vendidas por producto y devolver los 10 artículos con mayor rendimiento
