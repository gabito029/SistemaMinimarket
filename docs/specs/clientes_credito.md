# Especificación de Clientes y Crédito

## Propósito
Gestionar las cuentas de los clientes, límites de crédito (fiados), saldos pendientes y abonos de deuda (amortizaciones) para reducir la pérdida de efectivo y rastrear créditos otorgados.

## Requerimientos

### Requerimiento: Cuenta de Cliente y Límites de Crédito
Cada cliente DEBERÁ registrarse con una identificación única, nombre completo, número de teléfono y un límite de crédito específico.
El sistema DEBE realizar un seguimiento del saldo deudor actual de cada cliente.
El sistema NO DEBERÁ permitir la actualización del límite de crédito de un cliente a un valor inferior a su saldo deudor actual.

#### Escenario: Registrar un cliente con límite de crédito
- **DADO** un formulario de registro de nuevo cliente
- **CUANDO** el usuario ingresa "Juan Pérez" y un límite de crédito de $100.00
- **ENTONCES** el cliente DEBERÁ crearse con un saldo deudor inicial de $0.00 y un límite de $100.00

---

### Requerimiento: Ventas con Pago a Crédito
Cuando una venta se liquida mediante Crédito, el sistema DEBE agregar el monto de la venta al saldo deudor actual del cliente.
El sistema DEBE exigir que `saldo deudor actual` + `monto de la nueva venta` <= `límite de crédito`.
La venta DEBERÁ ser rechazada si el cliente no tiene un límite de crédito asignado o si este es excedido.

#### Escenario: Compra a crédito exitosa
- **DADO** un cliente con un saldo deudor actual de $20.00 y un límite de $100.00
- **CUANDO** se realiza una venta a crédito de $50.00 bajo el nombre de este cliente
- **ENTONCES** la transacción DEBERÁ ser exitosa, y el saldo deudor del cliente DEBE actualizarse a $70.00

---

### Requerimiento: Abonos de Clientes (Amortizaciones)
El sistema DEBERÁ permitir pagos/amortizaciones destinados a reducir el saldo deudor de un cliente.
El monto del pago DEBE reducir el saldo deudor actual del cliente.
Los detalles del pago (fecha, monto, método de pago) DEBEN registrarse para fines de trazabilidad.

#### Escenario: Realizar un pago total
- **DADO** un cliente con un saldo deudor de $70.00
- **CUANDO** el cliente realiza un pago de $70.00 en Efectivo
- **ENTONCES** el saldo deudor del cliente DEBE ser $0.00, y DEBERÁ crearse un registro de abono por $70.00
