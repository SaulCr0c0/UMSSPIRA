# Persistencia

Los identificadores y sus referencias usan columnas UUID nativas de PostgreSQL. Prisma las declara como `String @db.Uuid`: `String` es su representación en TypeScript y `@db.Uuid` define el tipo de almacenamiento. Prisma no tiene un escalar llamado `UUID`. Los identificadores generados en el backend utilizan `randomUUID()` de Node; las entradas HTTP y los identificadores incluidos en tokens se validan con `z.uuid()`. Los códigos de permisos y los hashes son textos con una función distinta de los identificadores de entidades.

`schema.prisma` es el esquema único de PostgreSQL. Incluye los modelos trasladados del SQL y las estructuras necesarias para identidad y sesiones. Las credenciales de conexión se leen desde el entorno; no forman parte de los modelos. El cliente generado se obtiene mediante `prisma:generate` y queda fuera del control de versiones.

`migrations` conserva el historial SQL revisable. La migración inicial representa las tablas del archivo de referencia. La siguiente incorpora autenticación propia, catálogos mínimos y protección de los registros de seguridad. No se aplica ninguna migración automáticamente al ejecutar Nest.

Las claves diferibles del SQL inicial se preservan en la migración porque Prisma no expresa esa característica en el modelo. Los CHECK y las políticas de acceso también pueden requerir SQL explícito. Regenerar un esquema no reemplaza esos detalles del historial.

Las tablas de credenciales, sesiones, permisos y usuarios tienen RLS habilitado sin políticas públicas. El backend se conecta con un rol PostgreSQL autorizado para esas tablas. Un rol restringido adicional necesitará los privilegios y políticas correspondientes; no se configura acceso directo de clientes a esos registros.

Cada equipo comparte el mismo esquema y cambia únicamente sus conexiones. Las bases independientes aíslan los datos durante desarrollo; los cambios de estructura se integran mediante migraciones compatibles. Un seed inserta datos, pero no reemplaza una migración. Los scripts de seed viven en `scripts/seed` para separar modelos y datos.
