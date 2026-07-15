# Especificación de Proveedores y Compras

## Propósito
Gestionar el catálogo de proveedores externos, registrar compras, actualizar automáticamente el stock del inventario tras el registro de compras y administrar las cuentas por pagar a proveedores.

## Requerimientos

### Requerimiento: Gestión de Proveedores
El sistema DEBERÁ mantener una lista de proveedores activos con su identificador tributario único (RUC/NIT/RFC), razón social, teléfono de contacto y correo electrónico.

#### Escenario: Registrar un nuevo proveedor
- **DADO** la página de gestión de proveedores
- **CUANDO** el administrador registra un proveedor con el identificador único "123456789" y el nombre "Distribuidora Abarrotes S.A."
- **ENTONCES** el registro del proveedor DEBERÁ ser guardado y estar disponible al crear nuevas órdenes de compra

---

### Requerimiento: Registro de Compras y Actualización de Inventario
Cuando se registra una compra a un proveedor, el sistema DEBE actualizar automáticamente el stock correspondiente de los productos comprados.
El sistema DEBE registrar la cantidad, costo de compra y fecha de vencimiento de cada artículo comprado.

#### Escenario: Incremento de stock al registrar una compra
- **DADO** un producto con un stock actual de 50 unidades y un precio de compra de $1.00
- **CUANDO** se registra una nueva compra de 100 unidades de este producto
- **ENTONCES** el stock actual del producto DEBE incrementarse a 150 unidades y los detalles de la transacción DEBERÁN ser registrados

---

### Requerimiento: Gestión de Cuentas por Pagar
El sistema DEBERÁ permitir marcar una compra como "Pendiente de Pago" para registrar una deuda con el proveedor.
El sistema DEBE generar una cuenta por pagar asociada, realizando el seguimiento del monto adeudado y la fecha de vencimiento.
Cuando se registren pagos contra la deuda, el sistema DEBE disminuir el saldo pendiente de la cuenta por pagar.

#### Escenario: Creación de una cuenta por pagar pendiente
- **DADO** un total de compra de $500.00 marcado como "Crédito"
- **CUANDO** se finaliza la compra
- **ENTONCES** una nueva cuenta por pagar de $500.00 bajo el registro del proveedor DEBERÁ ser creada con el estado "Pendiente"
