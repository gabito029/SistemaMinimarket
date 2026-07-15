# Especificación de Seguridad y Control de Roles

## Propósito
Garantizar el acceso seguro al sistema mediante credenciales encriptadas y restringir las operaciones críticas según el rol asignado (Administrador vs Cajero).

## Requerimientos

### Requerimiento: Autenticación por JWT
El sistema DEBERÁ exigir credenciales válidas (usuario y contraseña) para acceder a los módulos privados.
Al iniciar sesión exitosamente, el backend DEBE emitir un token web JSON (JWT) encriptado y seguro.
El cliente frontend DEBE almacenar este token de forma segura para autenticar peticiones subsecuentes.

#### Escenario: Inicio de sesión exitoso
- **DADO** un usuario con credenciales correctas registradas
- **CUANDO** el usuario ingresa su login y contraseña en el formulario
- **ENTONCES** el sistema DEBE autorizar el acceso y retornar el token JWT que identifica al usuario y su rol

---

### Requerimiento: Control de Acceso por Roles (RBAC)
El sistema DEBE soportar al menos dos roles: `Administrador` y `Cajero`.
El rol `Cajero` DEBERÁ estar limitado a las operaciones de caja y terminal POS.
El rol `Administrador` DEBE poseer accesos totales a la configuración, proveedores, cuentas por pagar y reportes gerenciales de caja.
El sistema MUST retornar un error HTTP 403 (Forbidden) si un usuario con rol `Cajero` intenta invocar endpoints administrativos del backend.

#### Escenario: Bloqueo de funcionalidad administrativa a Cajero
- **DADO** un usuario logueado con el rol de "Cajero"
- **CUANDO** intenta acceder a la pestaña de administración de cuentas por pagar o modificar un límite de crédito
- **ENTONCES** el frontend DEBE ocultar el botón/menú correspondiente, y el backend MUST rechazar la petición directa a la API devolviendo un código de error de falta de autorización

---

### Requerimiento: Registro de Auditoría
El sistema DEBERÁ registrar un histórico (Log de Auditoría) con cada acción crítica de los usuarios (inicios de sesión, cambios de límites de crédito y cierres de caja) indicando fecha, hora, usuario y dirección IP o dispositivo.
