-- Datos deterministas para probar elegibilidad y desactivación de mentor.
-- Ejecutar después de las migraciones de supabase/migrations.
INSERT INTO usuario (usuario_id, nombre, rol) VALUES
	('30000000-0000-4000-8000-000000000001', 'Lucia Rojas', 'EGRESADO'),
	('30000000-0000-4000-8000-000000000002', 'Mario Prueba', 'EGRESADO'),
	('30000000-0000-4000-8000-000000000003', 'Andrea Vargas', 'EGRESADO')
ON CONFLICT (usuario_id) DO UPDATE SET nombre = EXCLUDED.nombre, rol = EXCLUDED.rol;

INSERT INTO mentor (
	id, usuario_id, experiencia, esta_activo, anios_exp, fecha_creacion,
	fecha_actualizacion, esta_verificado, esta_aprobado, tiene_restriccion,
	perfil, configuracion, motivo_desactivacion
) VALUES
	(
		'40000000-0000-4000-8000-000000000001',
		'30000000-0000-4000-8000-000000000001',
		'Experiencia en APIs, PostgreSQL y servicios en la nube.', true, 4, CURRENT_DATE,
		CURRENT_DATE, true, true, false,
		'{"personalInfo":{"firstName":"Lucia","lastName":"Rojas","email":"lucia.rojas@example.test","phone":"+591 70000001"},"academicInfo":{"career":"Ingenieria de Sistemas","degree":"Licenciatura","graduationYear":2021},"professionalInfo":{"summary":"Desarrolladora backend con experiencia en APIs.","yearsExperience":4},"description":"Mentora de sistemas distribuidos.","experienceDescription":"Experiencia en APIs, PostgreSQL y servicios en la nube."}',
		'{"maxMentees":3,"topics":["Backend","Bases de datos"],"bio":"Mentora de sistemas distribuidos."}', null
	),
	(
		'40000000-0000-4000-8000-000000000002',
		'30000000-0000-4000-8000-000000000002',
		'Perfil incompleto para validar los campos mínimos.', true, 0, CURRENT_DATE,
		CURRENT_DATE, true, true, false,
		'{"personalInfo":{"firstName":"Mario","lastName":"","email":"mario.invalid","phone":""},"academicInfo":{"career":"Diseno Grafico","degree":"","graduationYear":0},"professionalInfo":{"summary":"","yearsExperience":-1},"description":"","experienceDescription":""}',
		'{"maxMentees":2,"topics":["UX"],"bio":"Perfil de prueba incompleto."}', null
	),
	(
		'40000000-0000-4000-8000-000000000003',
		'30000000-0000-4000-8000-000000000003',
		'Experiencia liderando equipos multidisciplinarios.', true, 7, CURRENT_DATE,
		CURRENT_DATE, false, false, true,
		'{"personalInfo":{"firstName":"Andrea","lastName":"Vargas","email":"andrea.vargas@example.test","phone":"+591 70000003"},"academicInfo":{"career":"Ingenieria Industrial","degree":"Licenciatura","graduationYear":2018},"professionalInfo":{"summary":"Lider de proyectos.","yearsExperience":7},"description":"Mentora de gestion de proyectos.","experienceDescription":"Experiencia liderando equipos multidisciplinarios."}',
		'{"maxMentees":1,"topics":["Gestion de proyectos"],"bio":"Perfil con restriccion de participacion."}', null
	)
ON CONFLICT (id) DO UPDATE SET
	usuario_id = EXCLUDED.usuario_id,
	experiencia = EXCLUDED.experiencia,
	esta_activo = EXCLUDED.esta_activo,
	anios_exp = EXCLUDED.anios_exp,
	fecha_actualizacion = EXCLUDED.fecha_actualizacion,
	esta_verificado = EXCLUDED.esta_verificado,
	esta_aprobado = EXCLUDED.esta_aprobado,
	tiene_restriccion = EXCLUDED.tiene_restriccion,
	perfil = EXCLUDED.perfil,
	configuracion = EXCLUDED.configuracion,
	motivo_desactivacion = EXCLUDED.motivo_desactivacion;
