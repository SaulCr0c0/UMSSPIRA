# Contexto backend UMSSPIRA

## Trabajo previo

- Se definieron las condiciones de elegibilidad para mentor: ser egresado, estar verificado y aprobado, no tener restricciones de participacion y completar el perfil minimo.
- Se implemento `MentorshipEligibilityService` para evaluar esas condiciones y devolver los motivos de rechazo y los campos faltantes.
- Se incorporo la desactivacion del rol de mentor conservando la configuracion previa del perfil.

## Perfil minimo requerido

- Datos personales: nombre, apellido, correo valido y telefono.
- Datos academicos: carrera, grado academico y anio de egreso entero.
- Datos profesionales: resumen y anios de experiencia como numero finito no negativo.
- Perfil: descripcion y descripcion de experiencia.
- Elegibilidad de negocio: egresado, verificado, aprobado y sin restriccion de participacion.

## Pruebas de mentorship

- `GET /` sirve la consola de pruebas del API en `http://localhost:3000`.
- `pnpm dev` inicia el API en watch y abre esa consola cuando queda disponible.
- `GET /mentorship/status` indica `supabase` o `demo`.
- `GET /mentorship/test-profiles` lista los casos de prueba.
- `POST /mentorship/eligibility` recibe `{ "profile": { ... } }`.
- `PATCH /mentorship/deactivate/:userId` recibe opcionalmente `{ "reason": "..." }` y conserva la configuracion.
- `supabase/seed.sql` crea tres casos: elegible, perfil incompleto e inelegible por verificacion/restriccion.
- Aplicar `supabase/migrations/0002_mentorship_eligibility.sql` antes de ejecutar el seed.

## Supabase y modo demo

El API utiliza Supabase REST con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en el entorno de `apps/api`. La clave de servicio es secreta: no se debe exponer al frontend ni guardar en el repositorio. Con ambas variables, los perfiles se leen desde `mentor` y la desactivacion actualiza `esta_activo`, `fecha_actualizacion`, `motivo_desactivacion` y mantiene `configuracion`. Sin ellas, se usa un conjunto local en memoria para probar reglas y flujo; esos cambios no persisten al reiniciar.

Al volver a ejecutar el seed se restauran los estados iniciales de los tres perfiles de prueba.