# Fronteras de los módulos

Un módulo representa una responsabilidad del sistema, no una persona ni necesariamente una épica. Una misma épica puede incluir documentos y revisión; varias épicas pueden necesitar conocer al usuario autenticado.

## Recorrido de una petición

1. Los guards compartidos verifican sesión y acceso.
2. Un schema de Zod valida y transforma la entrada en `http/schemas`.
3. El controlador llama a una operación de `application`.
4. La operación aplica reglas y utiliza los puertos que necesita.
5. Un adaptador de `infrastructure` resuelve el acceso externo.
6. El presenter transforma el resultado en una respuesta pública explícita.

El dominio y la aplicación no conocen códigos HTTP. Sus errores expresan lo que ocurrió; el filtro global decide cómo representarlo al cliente. Un translator convierte registros de persistencia o mensajes externos. Un presenter decide qué campos salen por HTTP. Esa diferencia evita exponer accidentalmente un hash o depender del nombre de una columna en una respuesta pública.

## Dependencias y composición

Las interfaces de `application/ports` describen lo que necesita un consumidor. Las implementaciones se registran en `*.module.ts`; Nest puede construir adaptadores y pasar interfaces a clases de aplicación mediante factories. La aplicación permanece independiente del contenedor.

Entre módulos se consumen contratos de aplicación, no repositorios concretos, clientes Prisma ni entidades internas de persistencia. `auth` depende del contrato de lectura de identidad de `user`. El hecho de compartir PostgreSQL no convierte todas las tablas en propiedad de todos los módulos.

Las rutas no incluyen roles: un permiso y el alcance de los datos determinan el acceso. Por ejemplo, tener permiso de lectura institucional no autoriza automáticamente cualquier carrera. Esa comprobación utiliza el contexto verificado y la entidad real, nunca un identificador de usuario aportado por headers.

## Distribución estándar de archivos

```text
<modulo>/
  <modulo>.module.ts
  README.md
  domain/
    entities/
    policies/
  application/
    contracts/
    ports/
    services/
    use-cases/
  http/
    controllers/
    cookies/
    schemas/
    presenters/
  infrastructure/
    providers/
    repositories/
    schemas/
    security/
    scripts/
    translators/
```

Se crean las subcarpetas que tengan una responsabilidad real en el módulo. No se colocan clases sueltas en la raíz de una capa. Los archivos se nombran por lo que hacen, con un caso de uso y una operación HTTP por archivo. `<modulo>.module.ts` permanece en la raíz porque compone el módulo completo.

Las rutas se declaran en los controladores de Nest; no se necesita una carpeta de routers adicional. Los modelos generados de Prisma permanecen fuera de los módulos, en su salida ignorada, y no sustituyen a las entidades de dominio.

En los nuevos módulos, los schemas HTTP se reúnen en un archivo por módulo dentro de `http/schemas/`. Cada controlador y caso de uso conserva su propio archivo. Se utilizan los mismos nombres de subcarpetas en empresas y vacantes, sin añadir archivos sueltos en la raíz de las capas.

## Permisos y alcance en los módulos nuevos

`AuthenticationGuard` y `PermissionsGuard` son globales. El controlador declara el permiso mediante `@RequirePermissions(...)` y obtiene el contexto con `@CurrentActor()`. No registra de nuevo los guards ni implementa una autenticación paralela.

Por ejemplo, `GetCompanyHeaderController` declara `GET :companyId/header` y `empresas:self:read`. El prefijo del controlador es `companies` y el global es `api/v1`. La ruta resultante es `/api/v1/companies/:companyId/header`.

El permiso concede la operación; el caso de uso comprueba el scope; el adaptador utiliza además el propietario real al consultar o conectar relaciones. Las tres comprobaciones tienen responsabilidades distintas. Un header de usuario o empresa no sustituye ninguna de ellas.
