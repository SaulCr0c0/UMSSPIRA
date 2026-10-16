#!/usr/bin/env node
/**
 * Crea un usuario EMPRESA en Supabase Auth y deja su perfil completo en la BD:
 *
 *   1. auth.users            -> usuario de login (email + password, email ya confirmado)
 *   2. public.usuario        -> lo crea solo el trigger on_auth_user_created, a partir
 *                               de user_metadata { nombre, rol: 'EMPRESA' }
 *   3. public.empresa        -> perfil corporativo, vinculado por id_usuario
 *   4. telefono_empresa / direccion_empresa -> opcionales (flags --telefono / --direccion)
 *
 * No necesita dependencias (usa fetch nativo de Node 18+). Lee SUPABASE_URL y
 * SUPABASE_SERVICE_ROLE_KEY de las variables de entorno o del .env (raiz o
 * apps/api/.env). La clave es la de service_role: nunca la anon.
 *
 * Uso:
 *   node scripts/create-empresa-user.js \
 *     --email contacto@acme.com --password secreto123 --nombre "ACME S.R.L." \
 *     [--razon-social "ACME S.R.L."] [--nit 1234567890] \
 *     [--descripcion "Descripcion corta"] [--correo contacto@acme.com] \
 *     [--sitio-web https://www.acme.com] \
 *     [--telefono "+591 4 4251234"] [--direccion "Av. Siempre Viva #742"] \
 *     [--departamento Cochabamba]
 *
 * Notas:
 *   * --nombre va a public.usuario.nombre; --razon-social a empresa.razon_social.
 *     Si no se pasa --razon-social se usa --nombre, y --correo toma --email.
 *   * El usuario queda con rol 'EMPRESA' (mismo valor que el usuario demo del
 *     seed supabase/seed.sql). OJO: el login de la API (POST /api/auth/login)
 *     hoy solo acepta 'administrador' | 'titulado', asi que este usuario NO
 *     puede iniciar sesion por el endpoint hasta ampliar los roles; para probar
 *     los endpoints de empresa se usan tokens de desarrollo (ver scripts/dev-token.js).
 *   * Es seguro re-ejecutarlo: si el usuario ya existe se reutiliza su id y se
 *     completa (sin pisar) el perfil que falte.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ------------------------------------------------------------
// Configuracion
// ------------------------------------------------------------

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const env = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return env;
}

function readConfig() {
  const files = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', 'apps', 'api', '.env'),
  ];
  const fromFiles = {};
  for (const file of files) Object.assign(fromFiles, readEnvFile(file));

  const url = process.env.SUPABASE_URL || fromFiles.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || fromFiles.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      'Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY. Definelas como variables de entorno o en apps/api/.env.',
    );
    process.exit(1);
  }
  return { url: url.replace(/\/$/, ''), serviceKey };
}

function parseArgs(argv) {
  const flags = {};
  const aliases = {
    '--razon-social': 'razonSocial',
    '--sitio-web': 'sitioWeb',
  };
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith('--') || value === undefined) {
      console.error(`Argumento invalido: ${key} (todos los flags llevan valor)`);
      process.exit(1);
    }
    const name = aliases[key] || key.slice(2);
    flags[name] = value;
  }
  return flags;
}

// ------------------------------------------------------------
// Supabase (Admin API de Auth + PostgREST con service_role)
// ------------------------------------------------------------

function serviceHeaders(serviceKey, extra = {}) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function createAuthUser({ url, serviceKey }, { email, password, nombre }) {
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: serviceHeaders(serviceKey),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true, // sin confirmacion de correo: es un usuario de pruebas/administracion
      user_metadata: { nombre, rol: 'EMPRESA' }, // lo lee el trigger on_auth_user_created
      app_metadata: { role: 'EMPRESA' },
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (res.ok) return { id: body.id, creado: true };

  const yaExiste =
    res.status === 422 ||
    /already.*(registered|exists)/i.test(body.msg || body.message || '');
  if (!yaExiste) {
    console.error(`No se pudo crear el usuario en Supabase Auth: ${body.msg || body.message || res.status}`);
    process.exit(1);
  }
  return { id: await findUserIdByEmail({ url, serviceKey }, email), creado: false };
}

async function findUserIdByEmail({ url, serviceKey }, email) {
  // La Admin API no filtra por email: se recorren paginas hasta dar con el.
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`${url}/auth/v1/admin/users?page=${page}&per_page=100`, {
      headers: serviceHeaders(serviceKey),
    });
    const body = await res.json().catch(() => ({}));
    const users = body.users || [];
    const match = users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
    if (match) return match.id;
    if (users.length < 100) break;
  }
  console.error(`El usuario ${email} ya existe pero no se encontro su id. Revisa el panel de Supabase (Authentication > Users).`);
  process.exit(1);
}

async function upsertUsuario(cfg, { id, nombre }) {
  // El trigger normalmente ya creo la fila; este insert es red de seguridad
  // (por si el usuario existia de antes o el trigger esta deshabilitado).
  const res = await fetch(`${cfg.url}/rest/v1/usuario`, {
    method: 'POST',
    headers: serviceHeaders(cfg.serviceKey, {
      Prefer: 'resolution=ignore-duplicates,return=minimal',
    }),
    body: JSON.stringify({ usuario_id: id, nombre, rol: 'EMPRESA' }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error(`No se pudo insertar public.usuario: ${body.message || res.status}`);
    process.exit(1);
  }
}

async function upsertEmpresa(cfg, { usuarioId, flags }) {
  const existente = await fetch(
    `${cfg.url}/rest/v1/empresa?id_usuario=eq.${usuarioId}&select=id`,
    { headers: serviceHeaders(cfg.serviceKey) },
  );
  const filas = await existente.json().catch(() => []);
  if (filas.length > 0) return { id: filas[0].id, creado: false };

  const id = crypto.randomUUID();
  const fila = {
    id,
    id_usuario: usuarioId,
    razon_social: flags['razon-social'] || flags.nombre,
    nit: flags.nit || null,
    descripcion: flags.descripcion || null,
    correo: flags.correo || flags.email,
    sitio_web: flags['sitio-web'] || null,
    fecha_registro: new Date().toISOString(),
  };
  const res = await fetch(`${cfg.url}/rest/v1/empresa`, {
    method: 'POST',
    headers: serviceHeaders(cfg.serviceKey, { Prefer: 'return=representation' }),
    body: JSON.stringify(fila),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`No se pudo insertar public.empresa: ${body.message || res.status}`);
    process.exit(1);
  }
  return { id, creado: true };
}

async function insertContacto(cfg, empresaId, flags) {
  const pendientes = [];
  if (flags.telefono) {
    pendientes.push(
      fetch(`${cfg.url}/rest/v1/telefono_empresa`, {
        method: 'POST',
        headers: serviceHeaders(cfg.serviceKey, { Prefer: 'resolution=ignore-duplicates,return=minimal' }),
        body: JSON.stringify({
          id: crypto.randomUUID(),
          id_empresa: empresaId,
          numero: flags.telefono,
          tipo: 'PRINCIPAL',
        }),
      }),
    );
  }
  if (flags.direccion) {
    pendientes.push(
      fetch(`${cfg.url}/rest/v1/direccion_empresa`, {
        method: 'POST',
        headers: serviceHeaders(cfg.serviceKey, { Prefer: 'resolution=ignore-duplicates,return=minimal' }),
        body: JSON.stringify({
          id: crypto.randomUUID(),
          id_empresa: empresaId,
          departamento: flags.departamento || null,
          direccion: flags.direccion,
        }),
      }),
    );
  }
  for (const piso of await Promise.all(pendientes)) {
    if (!piso.ok) {
      const body = await piso.json().catch(() => ({}));
      console.error(`Aviso: no se pudo guardar el contacto: ${body.message || piso.status}`);
    }
  }
}

// ------------------------------------------------------------
// Programa principal
// ------------------------------------------------------------

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  if (!flags.email || !flags.password || !flags.nombre) {
    console.error('Faltan argumentos obligatorios: --email, --password y --nombre.');
    console.error('Uso: node scripts/create-empresa-user.js --email ... --password ... --nombre ...');
    process.exit(1);
  }

  const cfg = readConfig();

  const auth = await createAuthUser(cfg, flags);
  console.log(
    auth.creado
      ? `Usuario creado en Supabase Auth: ${flags.email}`
      : `Usuario ya existia en Supabase Auth: ${flags.email} (se reutiliza)`,
  );

  await upsertUsuario(cfg, { id: auth.id, nombre: flags.nombre });
  const empresa = await upsertEmpresa(cfg, { usuarioId: auth.id, flags });
  console.log(
    empresa.creado
      ? `Perfil de empresa creado: ${empresa.id}`
      : `La empresa ya tenia perfil: ${empresa.id} (se deja igual)`,
  );
  await insertContacto(cfg, empresa.id, flags);

  console.log('\nResumen:');
  console.log(`  usuario_id (auth.users y public.usuario): ${auth.id}`);
  console.log(`  empresa.id:                               ${empresa.id}`);
  console.log(`  rol:                                      EMPRESA`);
  console.log('\nRecordatorio: el login (POST /api/auth/login) hoy solo acepta los roles');
  console.log("'administrador' y 'titulado'; para probar los endpoints de empresa usa un");
  console.log('token de desarrollo con claim empresaId (patron de scripts/dev-token.js).');
}

main().catch((err) => {
  console.error('Error inesperado:', err.message || err);
  process.exit(1);
});
