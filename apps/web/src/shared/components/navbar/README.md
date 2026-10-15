# Navbar compartida

El diseño proviene de `EventsHeader`, la barra inferior de `/events`: logo,
paleta azul, altura, enlaces, subrayado naranja, iconos y bloque de usuario.
Sus estilos ahora son CSS Modules, independientes de los estilos de eventos.

## Estructura

- `navbar.tsx`: composición y apertura/cierre de paneles; escritorio y móvil.
- `connected-navbar.tsx`: integración con la sesión real y cierre de sesión.
- `navigation.ts`: destinos, agrupación, roles y cálculo del apartado activo.
- `navbar-links.tsx`: presentación común de destinos y funciones pendientes.
- `activity-panel.tsx`: paneles de mensajes y notificaciones.
- `search-dialog.tsx`: búsqueda de accesos disponibles.
- `types.ts`: contrato de sesión y acciones; no autentica usuarios.
- `navbar.module.css`: diseño y adaptación responsiva, sin estilos globales.
- `index.ts`: entrada pública del componente.

Importar con `@/shared/components/navbar/index`. La ruta explícita evita resolver
el antiguo archivo vecino `shared/components/navbar.tsx`, aún no migrado.

## Uso

```tsx
import { Navbar } from '@/shared/components/navbar/index';

<Navbar session={session} onLogout={cerrarSesion} />
```

La aplicación proporciona la sesión y el cierre real. Para un visitante se pasa
`session={null}`; se usa la variante blanca con login y registro. La variante
autenticada mantiene el diseño azul de eventos y muestra nombre y rol reales.

`resolveHref` y `currentPath` permiten usar el mismo componente dentro de un
laboratorio sin cambiar las rutas canónicas. `onSearch` permite conectar un
buscador externo; sin él se abre el buscador de rutas incluido. Las listas de
mensajes y notificaciones son opcionales: no se dibuja un aviso de elementos
sin leer si no hay datos. `accountExtra` permite insertar controles de prueba
sin importar código del laboratorio desde shared.

## Agregar destinos

Editar `navigation.ts`; no duplicar menús en JSX. `roles` controla la visibilidad
de un acceso, no reemplaza guards ni autorización del backend. Si no existe una
pantalla, usar `pending` sin `href`: no agregar enlaces `#` ni rutas inventadas.
Los registros dinámicos se abren desde sus listados con un identificador real.

## Roles y cambios visuales

La misma estructura y configuración se utilizan en escritorio y móvil.
La variante depende de `session`, no del nombre de la URL ni de que una cookie
declare por sí sola un rol.

| Sesión | Apariencia | Accesos específicos |
| --- | --- | --- |
| Visitante | Blanca; Iniciar sesión y Registro. | Comunidad, beneficios, información institucional, oportunidades, red de mentorías y catálogo de eventos. |
| Titulado | Azul; identidad, cuenta y Cerrar sesión. | Área personal; perfil, registros, completar perfil y afinidad; información, áreas, intereses y disponibilidad del mentor. |
| Empresa | Azul; identidad, cuenta y Cerrar sesión. | Perfil de empresa y publicación de vacantes. No muestra configuración personal de mentor ni gestión administrativa. |
| Administrador | Azul; identidad, cuenta y Cerrar sesión. | Accesos de titulado y empresa; gestión, creación y borradores de eventos; solicitudes, reportes y panel administrativo en el menú de cuenta. |

Estas son las reglas actuales de presentación de `navigation.ts`. El administrador
incluye accesos de otros perfiles por decisión explícita de esa configuración;
si el equipo cambia esa política se editan las listas `roles` de cada destino.
Los guards de cada pantalla y la API siguen siendo quienes autorizan realmente.

El directorio de egresados no tiene página: aparece con explicación, sin un
enlace falso. Algunas rutas públicas sí existen pero su contenido sigue pendiente;
la barra no implementa esos módulos.

## Sesión real y sesión de prueba

`ConnectedNavbar` restaura el token de la sesión del proyecto (cookie, servicio de
sesión o almacenamiento empresarial existente) y consulta `GET /api/auth/me`.
Solo muestra la variante autenticada con un rol reconocido devuelto por la API.
No confía en la cookie del rol para decidir qué opciones mostrar. Sin token,
con sesión rechazada o sin poder validarla, se presenta como visitante.

Se vuelve a comprobar al cambiar de ruta o de token, recuperar el foco o recibir
un evento de almacenamiento. El contrato de `/me` entrega email y rol; mientras
no haya un nombre completo, se muestra la parte del email anterior a `@`.

Cerrar sesión limpia las cookies del login, el token de sessionStorage, el token
empresarial de localStorage y el estado de autenticación antes de ir a `/login`.
No se generan mensajes ni notificaciones ficticios en la pantalla oficial.

El laboratorio sigue pasando su sesión ficticia directamente a `Navbar`. Nunca
se restaura ese perfil mock dentro de `ConnectedNavbar`.

## Dónde está integrada

- `/portal/institucional`: `PortalSiteHeader` monta `ConnectedNavbar`; la página
  ya no monta su antigua `PublicNavbar`, de modo que hay una única barra.
- `/pruebas/navegacion`: mismo diseño, con adaptador y recorridos mock.
- Las demás rutas conservan sus integraciones previas. Para migrarlas hay que
  hacerlo desde sus layouts y retirar las barras locales, montando una instancia.
