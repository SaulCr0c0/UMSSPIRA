# Directorio y perfil de mentores

Migra participación, información profesional, áreas, intereses, disponibilidad y desactivación administrativa. `POST /api/v1/mentorship/requests` crea solicitudes pendientes y valida que el titulado, el mentor y el horario cumplan las reglas. `GET /api/v1/mentorship/requests` lista solicitudes recibidas del mentor autenticado (página máxima de 20); `GET /api/v1/mentorship/requests/:id` consulta el detalle. `PATCH /api/v1/mentorship/requests/:id/accept` y `PATCH /api/v1/mentorship/requests/:id/reject` responden solicitudes pendientes. La aceptación crea una conexión en la misma transacción y las respuestas encolan correo usando el worker SMTP existente. No requieren cambios de tablas ni migraciones.

## Rutas y acceso

Nest registra las rutas en los decoradores de cada controlador y conecta las clases en mentorship.module.ts. Cada archivo representa una operación; los schemas Zod comparten http/schemas/mentorship.schemas.ts. No se necesita un router de Express.

Los guards globales verifican sesión y RequirePermissions. La identidad propia se obtiene del actor; ningún body ni header puede escoger otro usuario. La desactivación administrativa comprueba las carreras asignadas al actor.

## Identidad y concurrencia

Usuario, titulado y mentor tienen UUID independientes. mentor.id_titulado enlaza un único perfil con su titulado. No comparar estos identificadores entre sí ni reutilizar actor.id como ID del mentor.

Las escrituras bloquean el titulado dentro de una transacción. Esto serializa cambios de participación, información, intereses, áreas y disponibilidad del mismo perfil; evita crear perfiles duplicados o agregar un interés después de quitar su área.

La información profesional usa columnas explícitas. La migración convierte el JSON histórico de experiencia; un mentor histórico sin titulado asociado detiene la migración para exigir una asociación válida.

## Disponibilidad

AVAILABLE acepta solicitudes, PAUSED conserva la visibilidad sin aceptarlas y UNAVAILABLE oculta el perfil del directorio. Sin estado registrado también permanece visible, pero no recibe solicitudes. Consultar no crea registros.

El módulo exporta MENTOR_AVAILABILITY_REPOSITORY mediante un port. Otros módulos pueden consultar canReceiveRequests sin importar Prisma ni consultar directamente estas tablas.

Los [contratos HTTP](../../../docs/endpoints/epic06-grupo06-hu1.6.md) documentan las rutas nuevas. La integración del frontend queda pendiente.
