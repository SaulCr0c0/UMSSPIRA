# Datos de demostración por épica

Desde la raíz del repositorio:

```sh
pnpm --filter api db:seed:demo
```

`demo.ts` carga la base compartida y después todos los archivos `epic-N.ts`. No hay que ejecutar un comando por equipo. Usa las conexiones de `apps/api/.env` y exige `APP_ENV=epic`, `dev` o `test`; no consulta la rama de Git.

## Dónde añadir los datos

| Archivo            | Datos                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `base.ts`          | Carreras compartidas y creación de cuentas con sus perfiles                                 |
| `demo-accounts.ts` | Cuentas de acceso de demostración y sus UUID                                                |
| `epic-1.ts`        | Tipos de archivo, detalles, documentos, solicitudes, administradores de sistema y auditoría |
| `epic-2.ts`        | Formación, experiencia, certificaciones, respaldos y validaciones                           |
| `epic-3.ts`        | Perfiles por área, diccionario NLP y resultados de radar                                    |
| `epic-4.ts`        | Empresas, modalidades y requerimientos                                                      |
| `epic-5.ts`        | Vacantes                                                                                    |
| `epic-6.ts`        | Áreas profesionales, mentores y especialidades                                              |
| `epic-7.ts`        | Eventos e inscripciones                                                                     |
| `epic-8.ts`        | Dispositivos de demostración, si se necesitan                                               |
| `epic-9.ts`        | Tipos de reporte, reportes y encuestas                                                      |

Los arreglos vacíos son el espacio para los datos de cada equipo. Se conservan las tres cuentas y las cinco áreas que ya existían; no se inventan datos del resto de módulos.

## Cómo añadir registros

Añadir objetos al arreglo correspondiente. El tipo generado por Prisma indica qué campos existen y cuáles son obligatorios. Por ejemplo, en `epic-2.ts`:

```ts
import { DEMO_GRADUATE_ID } from './demo-accounts';

export const formaciones: Array<Prisma.FormacionAcademicaCreateManyInput & { id: string }> = [
  {
    id: '22000000-0000-4000-8000-000000000001',
    id_titulado: DEMO_GRADUATE_ID,
    institucion: 'UMSS',
    titulo: 'Ingeniería de Sistemas',
    anio_egreso: 2025,
  },
];
```

Generar cada UUID una vez y guardarlo en el archivo. Para las referencias, importar las constantes existentes; no generar IDs nuevos cada vez que corre la seed. Si se añaden cuentas en `demo-accounts.ts`, cada una necesita un `id` y un `profileId` propios; `careerId` debe existir en las carreras de `base.ts` cuando corresponda. Se pueden añadir varias cuentas del mismo rol.

Cada tabla se inserta con `skipDuplicates` o con `upsert` sin actualizaciones: repetir el comando agrega los registros faltantes y conserva los existentes, incluidas las contraseñas. Cambiar un objeto con el mismo UUID no actualiza la fila guardada. Un conflicto de correo con otro UUID detiene la carga de cuentas.

## Relaciones y orden

Primero se crean carreras, roles, permisos, cuentas y perfiles. Después se ejecutan las épicas en este orden: **1, 2, 6, 3, 4, 5, 7, 8, 9**. La 6 precede a la 3 porque ambas usan las áreas profesionales. Las áreas padre van antes de las hijas.

Dentro de cada archivo se crean primero las tablas referenciadas y después sus dependientes. Si se incorpora otra tabla, añadir su arreglo tipado y su inserción al archivo de la épica, respetando ese orden. No crear de nuevo una cuenta o un área compartida desde otra épica: usar su UUID.

La carga no es una única transacción: si una etapa falla, las anteriores pueden haber quedado guardadas. El comando indica la etapa y puede repetirse después de corregir el problema. Los equipos deben coordinar los cambios en datos compartidos antes de integrarlos en dev; tener bases separadas no resuelve los conflictos entre archivos al unir las ramas.

Las validaciones de certificaciones se cargan en `epic-2.ts`, después de sus certificaciones. Su `id_administrador_sistema` debe existir en `administradoresSistema` de `epic-1.ts`; no es el UUID del usuario ni el de administrador de carrera. `estado_validacion` usa `sin_respaldo`, `validado` u `observado`; el historial de validación usa `con_respaldo` u `observado`, según el documento del equipo. Añadir un respaldo no equivale a una aprobación automática.

`db:seed` sigue siendo la carga de roles y permisos sin datos de demostración. `db:seed:demo` ya la incluye.
