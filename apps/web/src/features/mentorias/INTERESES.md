# HU 6.3: intereses específicos de mentoría

Vista de desarrollo: `http://localhost:3001/mentorias/perfil/intereses?demo=1`.
El modo de prueba solo se habilita fuera de producción. Usa datos ficticios en memoria;
no requiere autenticación, no escribe en la API y se reinicia al recargar la página.
Permite simular las áreas de la HU 6.2 y un error de guardado.

La ruta normal muestra un estado de funcionalidad pendiente hasta integrar la API.
No se han supuesto endpoints ni nombres de campos del backend.

## Integración pendiente

`MentorInterests` recibe un catálogo de `InterestArea`, la configuración guardada
(`areaIds`, `topicIds`) y `onSave(configuration)`. El adaptador de la API deberá mapear
los campos reales a estos tipos del frontend y enviar el Bearer token del login.
El componente debe montarse después de cargar el catálogo y la configuración.
Al cambiar de usuario o recargar datos externos, debe montarse con una nueva `key`.

`onSave` debe resolver con la configuración confirmada por el servidor; debe rechazar
si el guardado falla. El éxito no se muestra antes de esa confirmación. Si se retiraron
áreas, la operación debe guardar las áreas y sus intereses de manera consistente.
El backend deberá validar la pertenencia de cada tópico a las áreas seleccionadas;
el filtrado en el frontend no reemplaza esa validación.

`areasHref` apunta a la futura pantalla de HU 6.2. `onNavigate` permite integrar otro
flujo de navegación; la vista de prueba lo usa para abrir la simulación de áreas.
Al navegar por los botones del editor, se confirma el descarte de cambios pendientes.
Al recargar o cerrar la pestaña, se solicita la confirmación del navegador.

Se permite una selección vacía: el diseño entregado no establece un mínimo de intereses.
La disponibilidad se muestra como siguiente paso, sin inventar un estado de completado.
