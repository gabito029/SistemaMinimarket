# Especificación del Terminal POS

## Propósito
Proporcionar una interfaz interactiva para que los cajeros escaneen o busquen productos, gestionen un carrito de compras y procesen transacciones con múltiples métodos de pago (Efectivo, Tarjeta, Crédito).

## Requerimientos

### Requerimiento: Búsqueda de Productos y Escaneo de Código de Barras
El sistema DEBERÁ permitir al operador buscar productos por texto (nombre) o escanearlos usando un lector de códigos de barras.
El sistema DEBE recuperar los detalles del producto incluyendo su nombre, precio y stock actual.

#### Escenario: Recuperación exitosa de producto mediante consulta de búsqueda
- **DADO** que el operador se encuentra en la pantalla del POS
- **CUANDO** el operador escribe un nombre de producto válido o escanea su código de barras
- **ENTONCES** el producto DEBERÁ listarse con sus detalles y estar disponible para agregarse al carrito

---

### Requerimiento: Operaciones del Carrito de Compras
El sistema DEBERÁ permitir agregar productos al carrito, modificar su cantidad y eliminar elementos.
El sistema DEBE calcular los subtotales y el total de forma dinámica a medida que se realizan cambios.
El sistema NO DEBERÁ permitir agregar una cantidad que exceda el stock disponible del producto.

#### Escenario: Agregar artículo al carrito dentro de los límites de stock
- **DADO** un producto con un stock de 10 unidades
- **CUANDO** el operador agrega 5 unidades al carrito
- **ENTONCES** el carrito DEBERÁ mostrar 5 unidades del producto y actualizar el monto total

#### Escenario: Rechazo al agregar un artículo que excede el stock
- **DADO** un producto con un stock de 10 unidades
- **CUANDO** el operador intenta agregar 11 unidades al carrito
- **ENTONCES** el sistema DEBE mostrar un mensaje de error y evitar agregar el artículo

---

### Requerimiento: Liquidación de Transacción y Métodos de Pago
El sistema DEBERÁ admitir tres métodos de pago: Efectivo, Tarjeta y Crédito.
El sistema DEBE validar las condiciones de pago antes de finalizar la transacción.
Si se selecciona Crédito, el sistema DEBE verificar que haya un cliente asignado, que el cliente esté activo y que no se exceda el límite de crédito del cliente.

#### Escenario: Venta finalizada mediante Efectivo
- **DADO** un total de carrito de $50.00 y Efectivo seleccionado como método de pago
- **CUANDO** el cajero confirma la transacción con $50.00 de efectivo recibido
- **ENTONCES** el sistema DEBERÁ registrar la venta, reducir el stock del producto y registrar la transacción en la sesión de caja activa

#### Escenario: Venta rechazada mediante Crédito por límite excedido
- **DADO** un cliente con un límite de crédito restante de $30.00 y un total de carrito de $40.00
- **CUANDO** el cajero intenta finalizar la venta a Crédito
- **ENTONCES** el sistema DEBE bloquear la transacción y mostrar un error de límite excedido
