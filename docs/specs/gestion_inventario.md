# Especificación de Gestión de Inventario

## Propósito
Administrar el catálogo de productos del minimarket, organizar los artículos por categorías y permitir el ajuste manual de stock por mermas o inventario físico.

## Requerimientos

### Requerimiento: CRUD de Productos
El sistema DEBERÁ permitir registrar, editar y desactivar productos de manera lógica.
Cada producto DEBE contener un código de barras único, nombre, precio de venta, stock actual y categoría asociada.

#### Escenario: Creación de un nuevo producto con código único
- **DADO** que el administrador se encuentra en el módulo de inventario
- **CUANDO** registra un producto con código "7750123456789", nombre "Leche Evaporada 400g" y precio de venta $1.20
- **ENTONCES** el producto DEBERÁ crearse con éxito con un stock inicial de 0 unidades

---

### Requerimiento: Gestión de Categorías
El sistema DEBERÁ permitir administrar las categorías principales del negocio (ej. Abarrotes, Lácteos, Limpieza).
Cada producto registrado MUST estar enlazado a una categoría válida existente.

#### Escenario: Asignar categoría a un producto
- **DADO** la categoría "Lácteos" registrada en el sistema
- **CUANDO** el administrador edita el producto "Leche Evaporada 400g" y selecciona la categoría "Lácteos"
- **ENTONCES** el sistema DEBE registrar la asociación del producto a dicha categoría

---

### Requerimiento: Ajuste Manual de Stock
El sistema DEBERÁ permitir a los usuarios autorizados (administradores) registrar ajustes de stock manuales (entradas o salidas de mercadería) justificando el motivo (merma, rotura, inventario físico).
Cada ajuste DEBE actualizar el stock disponible del producto de forma inmediata.

#### Escenario: Registro de merma de producto
- **DADO** un producto con stock actual de 20 unidades
- **CUANDO** el administrador registra un ajuste de salida por 2 unidades debido a "Rotura de empaque"
- **ENTONCES** el stock actual del producto DEBERÁ disminuir automáticamente a 18 unidades, y se DEBERÁ crear un registro histórico de auditoría del ajuste
