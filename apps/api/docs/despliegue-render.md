# Publicar únicamente el backend en Render

El frontend continúa en `https://umsspira-web.vercel.app`. Render ejecuta Nest y Supabase aloja únicamente PostgreSQL. Las peticiones del frontend pasan por su proxy `/api/v1/...`, que ya reenvía las cookies al backend.

## 1. Preparar la base que usará el servidor

En tu PC, completar `apps/api/.env` con las conexiones de esa base. Usar `APP_ENV=dev` si será la demostración compartida. Desde la raíz del repositorio:

```sh
pnpm install
pnpm --filter api db:deploy
pnpm --filter api prisma:generate
pnpm --filter api db:seed:demo
```

La última línea es el único comando para cargar cuentas y datos de todas las épicas. Si las tablas ya están actualizadas y el cliente generado, basta con esa línea. La guía de [la seed](../scripts/seed/README.md) explica qué contiene y cómo ampliarla.

Para la base vacía del sistema simulado real, usar `APP_ENV=production` y reemplazar la última línea por `pnpm --filter api db:seed`: carga únicamente catálogos y permisos. No crea personas ni trámites de demostración.

Los comandos usan la base indicada en `.env`, no una base deducida de la rama. Las migraciones y la seed se ejecutan explícitamente, antes de publicar; no se repiten al arrancar Nest.

## 2. Crear el Web Service

En Render, crear **New > Web Service** y conectar el repositorio. Para despliegues automáticos, usar **Git Provider**. La opción **Public Git Repository** de la captura también sirve, pero requiere despliegues manuales. [Documentación de Render](https://render.com/docs/deploys).

El código debe estar subido a la rama que selecciones. Render no puede utilizar cambios que solo existen en tu PC.

| Campo              | Valor                                                                         |
| ------------------ | ----------------------------------------------------------------------------- |
| Name               | `umsspira-api` o un nombre disponible                                         |
| Branch             | `dev`, cuando contenga estos cambios; si se prueba otra rama, seleccionar esa |
| Language / Runtime | Node                                                                          |
| Region             | La más cercana a la región de tu proyecto Supabase                            |
| Root Directory     | Dejar vacío: raíz del repositorio                                             |
| Build Command      | `pnpm install --frozen-lockfile --prod=false && pnpm --filter api build`      |
| Start Command      | `pnpm --filter api start`                                                     |
| Health Check Path  | `/health`                                                                     |
| Instance Type      | Free para la demostración                                                     |

La compilación incluye el cliente Prisma y Nest. Solo inicia el backend. La raíz debe conservarse porque contiene el workspace y el lockfile; Render no permite acceder a archivos fuera del directorio configurado. [Monorepos en Render](https://render.com/docs/monorepo-support).

## 3. Variables de Render

Agregar en **Environment** estos valores, sin comillas alrededor:

```dotenv
NODE_VERSION=22.22.1
NODE_ENV=production
APP_ENV=dev
AUTH_RATE_LIMIT_STORE=memory
CORS_ORIGINS=https://umsspira-web.vercel.app
DATABASE_URL=CONEXION_POSTGRES_POOLER_6543
DIRECT_URL=CONEXION_POSTGRES_POOLER_5432
AUTH_JWT_SECRET=CLAVE_PROPIA_DE_ESTE_ENTORNO
```

Reemplazar las dos conexiones por las URL completas del mismo Supabase preparado en el paso 1. `APP_ENV=dev` permite datos falsos; no depende del nombre de rama. `NODE_ENV=production` activa el comportamiento del servidor publicado, incluidas las cookies HTTPS. No hace falta Redis para esta instancia única: `memory` elige el limitador local.

Generar la clave una vez, pegar el resultado en `AUTH_JWT_SECRET` y conservarlo entre despliegues:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Dejar `PORT` sin configurar: la API escucha el valor que entrega Render y ya está preparada para escuchar en `0.0.0.0`. No copiar el `PORT=3000` local.

Para los flujos que envían correo, agregar también `SMTP_URL` y `MAIL_FROM` con los valores reales del proveedor. Ejemplo de formato, no credenciales utilizables:

```dotenv
SMTP_URL=smtp://USUARIO:CONTRASENA@HOST_DEL_PROVEEDOR:2525
MAIL_FROM=UMSSPIRA <no-reply@DOMINIO_VERIFICADO>
```

Usuario y contraseña deben codificarse para URL si contienen caracteres especiales. El proveedor debe admitir ese puerto y el remitente configurado. La configuración local de Mailpit (`127.0.0.1:1025`) no sirve para entregar correos desde Render.

Render Free bloquea las conexiones salientes a los puertos 25, 465 y 587. Se necesita un proveedor que admita otro puerto, como 2525, o un plan que permita 465/587. Sin correo configurado se puede probar el login de la seed, pero no completar verificación, registro y activación. [Limitaciones del plan gratuito](https://render.com/docs/free).

Crear el servicio y abrir `https://TU-SERVICIO.onrender.com/health`. Debe responder con la API y PostgreSQL en estado correcto. Copiar la URL raíz del servicio, sin `/health` ni `/api/v1`.

El archivo `render.yaml` contiene estos ajustes para quien use Blueprints. Si creas el servicio con el formulario de la captura, debes completar sus campos; ese formulario no aplica automáticamente el YAML.

## 4. Conectar el frontend de Vercel

En el proyecto del frontend: **Settings > Environment Variables**. Para **Production**, configurar:

```dotenv
API_INTERNAL_URL=https://TU-SERVICIO.onrender.com
NEXT_PUBLIC_API_URL=https://TU-SERVICIO.onrender.com
```

Usar la URL real de Render sin `/api/v1` al final. Reemplazar los valores del backend anterior y volver a desplegar el frontend con el código actualizado. Las variables se aplican al siguiente despliegue. [Variables de Vercel](https://vercel.com/docs/environment-variables).

`API_INTERNAL_URL` la consume el proxy de Next y la comprobación de sesión. `NEXT_PUBLIC_API_URL` mantiene los consumidores que todavía necesitan una URL pública. No colocar credenciales de PostgreSQL ni `AUTH_JWT_SECRET` en Vercel.

Abrir `/health` en Render y después `https://umsspira-web.vercel.app/login`. Probar con `admin@umss.edu.bo` / `admin1234` o las otras cuentas de la seed. No se requieren cambios de pantallas ni de navbars para conectar ambos despliegues.

## Primer acceso en Free

Render Free se duerme después de 15 minutos sin tráfico y puede tardar aproximadamente un minuto en despertar. El proxy del frontend espera 15 segundos, así que ese primer login puede devolver 503: abrir `/health`, esperar a que responda y volver a intentar. [Comportamiento del plan Free](https://render.com/docs/free).

Los datos, documentos y sesiones se guardan en PostgreSQL. El limitador en memoria se reinicia con el proceso; para varias instancias habría que seleccionar Redis. La seed no se ejecuta en cada despliegue ni crea sesiones, OTP o suscripciones push ficticias.
