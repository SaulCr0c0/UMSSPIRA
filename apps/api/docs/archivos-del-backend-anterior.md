# Archivos del backend anterior

El backend activo usa Prisma y sus migraciones en apps/api/prisma. Los archivos históricos no forman una segunda fuente de esquema ni deben ejecutarse sobre la base nueva.

| Ubicación | Uso encontrado | Tratamiento |
| --- | --- | --- |
| apps/api-antigua/data/graduates-report.mock.csv | CSV de ejemplo de reportes, sin referencias de lectura en el código | No mover a producción ni al seed. Si se conserva como fixture al migrar reportes, ubicarlo en test/fixtures/reports |
| scripts/dev-token.js | Genera un JWT del esquema anterior, sin sesión persistida | Retirable: no autentica en el backend nuevo. Usar login y las cuentas del seed |
| scripts/ de la raíz | Solo contiene dev-token.js | Se puede retirar junto con ese script cuando se haga la limpieza acordada |
| supabase/ de la raíz | Historial SQL, buckets, triggers y seed del sistema anterior | Retirar después de migrar los módulos pendientes y ajustar referencias de docker-compose.yml y README; no usar sus seeds ni db push en la base nueva |
| packages/shared-types | Contratos TypeScript y constantes consumidos por el frontend | Conservar: apps/web declara la dependencia y 36 archivos lo importan al momento de esta revisión |

docker-compose.yml todavía monta la migración inicial antigua en el servicio db. El backend activo apunta al PostgreSQL alojado en Supabase; para retirar supabase/ también se debe retirar o adaptar ese servicio local. La CLI supabase del package.json raíz se puede revisar en la misma limpieza, independientemente del SDK que aún figura como dependencia del frontend.

shared-types no es una copia del backend, un volcado de datos ni el cliente generado de Prisma. Describe intercambios y valores compartidos. El backend nuevo define sus propios contratos de aplicación y HTTP; la alineación del paquete con esos contratos corresponde a la futura integración del frontend.

Esta revisión no elimina archivos históricos ni modifica el frontend.
