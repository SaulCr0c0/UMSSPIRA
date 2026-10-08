# Proyecto Fexco (nombre provisional — ajustar)

Monorepo con **pnpm workspaces**: API en NestJS, frontend en Next.js, tipos compartidos y base de datos en Supabase.

## Stack

- **apps/api** — NestJS (REST), Redis, Supabase como cliente de base de datos
- **apps/web** — Next.js 14 (App Router), Tailwind CSS
- **packages/shared-types** — Tipos TypeScript compartidos entre `api` y `web`
- **supabase/** — Migraciones SQL y seed de la base de datos
- Gestor de paquetes: **pnpm** (workspace único, `pnpm-workspace.yaml`)
- Husky + lint-staged + commitlint (Conventional Commits) para hooks de git

---

## Requisitos previos

- Node.js > 20
- pnpm (`corepack enable` o `npm i -g pnpm`)
- Docker (para `docker-compose.yml` — Redis / Supabase local si aplica)
 - git

## Instalación

```bash
git clone https://github.com/SaulCr0c0/UMSSPIRA.git
cd UMSSPIRA
pnpm install
```

Esto instala las dependencias de **todos** los workspaces (`apps/api`, `apps/web`, `packages/shared-types`) de una sola vez.

## Variables de entorno

La API lee **un solo** archivo de entorno en `apps/api/`, elegido al arrancar:

| Archivo | Uso | ¿Se sube a Git? |
| --- | --- | --- |
| `.env` | Proyecto de Supabase **en la nube** (fuente de verdad) | No — contiene secretos |
| `.env.localstack` | Stack **local** de Docker, como respaldo sin red | No — lo genera cada quien |
| `.env.localstack.example` | Plantilla con las instrucciones | Sí |

Para usar el respaldo local, una sola vez por máquina:

```bash
cp apps/api/.env.localstack.example apps/api/.env.localstack
npx supabase status   # copiar el valor de SECRET_KEY dentro del archivo creado
```

```bash
pnpm dev                      # usa apps/api/.env (nube)
pnpm --filter api dev:local   # usa apps/api/.env.localstack (stack local de Docker)
```

Las claves de la nube (`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`) las comparte el equipo por el grupo de WhatsApp. **Nunca** se commitean: `.env` ya está en `.gitignore`.

El frontend usa `apps/web/.env.local` con `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:3000`).

## Levantar servicios locales (Docker)

```bash
docker compose up -d
```

Levanta los servicios de soporte (hoy solo **Redis**). La base de datos **no** vive en Docker: es Supabase, y se configura en `apps/api/.env` (ver *Variables de entorno*). El stack local de Supabase es opcional y solo sirve como respaldo.

Para poder ejecutar y configurar la base de datos de manera local se puede utilizar dos extensiones o el 
el cliente de postgresql

* Database client o SQLtools: ambas te permiten 
hacer cambios en la bd en vscode
* DBeaver: cliente oficial te da una interfaz grafica para los cambios

(Recomendacion) si te equivocaste en tus cambios y no sabes como regresar solo apaga el docker compose con el comando


```
docker compose down -v  # WARNING: permanently deletes db_data and all local data; use `docker compose down` to preserve it
```

De esta manera puedes volver a crear la bd con el comando inicial de Docker y te dara una bd nueva.

Se recomienda apagar el docker una vez que termines tu trabajo 

## Ejecutar el proyecto

**Todo el monorepo en paralelo:**
```bash
pnpm dev
```

**Por separado**, en dos terminales:

```bash
# Backend (NestJS) — apps/api
pnpm --filter api dev

# Frontend (Next.js) — apps/web
pnpm --filter web dev
```

- API por defecto en `http://localhost:3000` (revisar `apps/api/src/main.ts`)
- Web por defecto en `http://localhost:3001`

### Probar el backend con Postman

1. Inicia el API desde la raiz del repositorio: `pnpm.cmd --filter api dev` en Windows PowerShell (o `pnpm --filter api dev` en otras terminales).
2. Deja abierta la terminal mientras el API se ejecuta en modo watch. No hace falta abrir una pagina web ni iniciar Docker para probar los perfiles de ejemplo en modo demo.
3. En Postman, importa `collection/mentorship-api.postman_collection.json` y luego importa `collection/environments/local.postman_environment.json` como environment.
4. Selecciona el environment **UMSSPIRA - Local API** y ejecuta las solicitudes en la carpeta **Mentorship API**. Para probar los mismos escenarios que antes ofrecía la consola, ejecuta **Evaluar perfil elegible**, **Evaluar perfil incompleto** y **Evaluar perfil con restricciones**; cada solicitud muestra el resultado y comprueba automáticamente la respuesta en la pestaña **Test Results**.
5. Para probar la desactivacion, ejecuta primero **Listar perfiles** (guarda automaticamente el identificador del primer perfil) y despues **Desactivar mentor**. Vuelve a **Listar perfiles** para ver el cambio. En modo demo, **Restablecer perfiles demo** revierte los datos.

Todas las solicitudes usan `http://localhost:3000` y envian/reciben JSON. La elegibilidad requiere un perfil activo, egresado, verificado y aprobado, sin restricciones, con todos los campos minimos validos; la respuesta indica campos faltantes/invalidos y condiciones incumplidas. La desactivacion solo aplica a mentores activos y conserva su configuracion. Si Postman indica que no puede conectarse, confirma que la terminal donde ejecutaste el API sigue abierta y que Nest no mostro errores de inicio. El endpoint raiz `/` no sirve un panel web; la API se prueba con las solicitudes de Postman. Al configurar Supabase, el restablecimiento demo deja de estar disponible.

## Colección de API (Postman)

Importar estos dos archivos en Postman: la coleccion `collection/mentorship-api.postman_collection.json` y el environment `collection/environments/local.postman_environment.json`.

## Tests (web)

```bash
pnpm --filter web test
```

---

## Dónde trabaja cada equipo / tarea

> Regla general: **si el tipo se usa en API y en Web, va en `packages/shared-types`.** No dupliques interfaces.

### Backend — `apps/api/src/`

| Tarea / feature | Carpeta |
|---|---|
| Lógica de **empresas** (companies) | `modules/companies/companies.module.ts` (+ agregar `companies.controller.ts`, `companies.service.ts`) |
| Lógica de **ofertas de trabajo** (job postings) | `modules/job-postings/job-postings.module.ts` (+ controller/service) |
| Conexión a Supabase | `shared/lib/supabase.ts` |
| Conexión a Redis (cache, colas, sesiones) | `shared/lib/redis.ts` |
| Bootstrap / configuración global de Nest | `main.ts`, `app.module.ts` |
| Nuevo módulo (ej. usuarios, auth) | Crear carpeta hermana en `modules/<nombre>/` siguiendo el mismo patrón (`*.module.ts`, `*.controller.ts`, `*.service.ts`) |

> `dist/` es la salida compilada — **nunca se edita a mano**.

### Frontend — `apps/web/src/`

| Tarea / feature | Carpeta |
|---|---|
| Páginas privadas / dashboard (empresas, ofertas) | `app/(dashboard)/companies/page.tsx`, `app/(dashboard)/job-postings/page.tsx` |
| Layout del dashboard | `app/(dashboard)/layout.tsx` |
| Login / registro (páginas públicas) | `app/(public)/login/page.tsx`, `app/(public)/register/page.tsx` |
| Layout raíz / estilos globales | `app/layout.tsx`, `app/globals.css` |
| Componentes reutilizables (botones, inputs, cards, navbar) | `shared/components/` |
| Cliente HTTP hacia la API | `shared/services/api-client.ts` |
| Utilidades (ej. `cn` para clases Tailwind) | `shared/utils/cn.ts` |
| Nueva sección del dashboard | Nueva carpeta en `app/(dashboard)/<seccion>/page.tsx` |
| Nueva sección pública | Nueva carpeta en `app/(public)/<seccion>/page.tsx` |

### Tipos compartidos — `packages/shared-types/src/`

| Tarea | Archivo |
|---|---|
| Tipo/interface de Empresa | `company.ts` |
| Tipo/interface de Oferta de trabajo | `job-posting.ts` |
| Exportar nuevos tipos | agregarlos en `index.ts` |

Se importan en ambas apps como `@umsspira/shared-types`.


(Recomendacion) Todos los archivos creados y carpetas son para dar una idea a los devs de como estructurar el proyecto y para que React no nos marque como proyecto vacio, entonces sientanse en la libertad de crear sus carpetas y archivos siguiendo las reglas descritas


### Testing / Postman

| Tarea | Archivo |
|---|---|
| Nuevos endpoints a probar manualmente | Agregar request a `collection/mentorship-api.postman_collection.json` (o crear colección nueva por módulo) |
| Tests de componentes/páginas web | Junto al archivo o en `__tests__/`, config en `jest.config.js` / `jest.setup.js` |

---

Las pruebas manuales del backend se hacen con Postman; las pruebas del frontend estan configuradas con Jest.

## Convenciones de commits

Se usa **Conventional Commits** (validado por `commitlint.config.js` + Husky):

```
feat(api): agregar endpoint de creación de empresas
fix(web): corregir validación de formulario de login
chore: actualizar dependencias
```

Si el commit no esta con esa nomenclatura sera rechazado por git y si por alguna razon lo suben asi a github no se tomara en cuenta, tomenlo en cuenta.


## Recomendacion de cambios

Para los cambios se recomienda usar atomic commits, 
significa que no me suban 20 cambios en un commit pequenio cambio que hacen y lo suben de esa manera es mas facil encontrar el error.

Si el dev sube un cambio con 20 cambios y el codigo marca error, sera el encargado de realizar la correccion
asi que tomarlo en cuenta

## Flujo de ramas

- `main` → producción
- `dev` → integración
- `epic*` → rama de integracion de las HUs de una epic
- `feat/NumerodeGrupo-IDdelaHU-nombreCorto` → rama para el trabajo de las HUs

Ejemplo de rama HU: feat/G1-HU2-login

---
