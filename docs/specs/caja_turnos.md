# Especificación de Caja y Turnos

## Propósito
Garantizar un control estricto de los turnos de los cajeros, el registro del efectivo inicial, el seguimiento en tiempo real de las ventas en efectivo y la conciliación de cierre (arqueo) con soporte para PDF imprimible.

## Requerimientos

### Requerimiento: Apertura de Sesión
El cajero DEBE abrir un nuevo turno especificando un monto inicial de efectivo de apertura.
El sistema NO DEBERÁ permitir el registro de transacciones de venta si no existe una sesión de caja activa para el cajero.

#### Escenario: Apertura exitosa de una sesión de caja
- **DADO** que el cajero no tiene ninguna sesión abierta
- **CUANDO** el cajero envía un monto de apertura de $100.00
- **ENTONCES** una nueva sesión de caja DEBERÁ crearse con el estado "Abierta", el efectivo inicial establecido en $100.00 y el saldo de caja actual establecido en $100.00

---

### Requerimiento: Seguimiento de Efectivo en Tiempo Real
El sistema DEBE calcular dinámicamente el saldo de caja teórico durante la sesión activa.
El saldo teórico DEBERÁ calcularse como: `efectivo inicial` + `suma de todas las ventas en efectivo` + `suma de abonos de crédito en efectivo` - `ajustes de caja`.

#### Escenario: Actualización del saldo en una venta en efectivo
- **DADO** una sesión de caja activa con un saldo teórico actual de $150.00
- **CUANDO** se completa una venta en efectivo de $45.00
- **ENTONCES** el sistema DEBE actualizar el saldo teórico de caja de la sesión a $195.00

---

### Requerimiento: Cierre de Sesión y Conciliación (Arqueo)
El cajero DEBERÁ cerrar la sesión declarando la cantidad física real de efectivo presente en la gaveta.
El sistema DEBE calcular cualquier diferencia entre el efectivo teórico y el efectivo físico (sobrante o faltante).
Al cerrar, el estado de la sesión DEBE cambiar a "Cerrada", registrando la fecha y hora del cierre.
El sistema DEBERÁ permitir la exportación de un resumen de la sesión cerrada en formato PDF, incluyendo firmas de conformidad.

#### Escenario: Cierre de sesión sin diferencias
- **DADO** una sesión de caja activa con un saldo teórico de $250.00
- **CUANDO** el cajero cierra la sesión e ingresa $250.00 como el monto de efectivo físico
- **ENTONCES** la sesión DEBERÁ marcarse como "Cerrada" con una diferencia de $0.00, y DEBERÁ generarse un reporte de resumen en PDF
