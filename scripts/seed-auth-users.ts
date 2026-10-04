// scripts/seed-auth-users.ts
// Correr una sola vez con: pnpm tsx scripts/seed-auth-users.ts
// Requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno (no el anon key).

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  const { error: adminError } = await supabase.auth.admin.createUser({
    email: 'admin@umss.edu.bo',
    password: 'Admin1234!',
    app_metadata: { role: 'administrador' },
    email_confirm: true,
  });
  if (adminError) console.error('Error creando admin:', adminError.message);
  else console.log('Usuario administrador creado: admin@umss.edu.bo / Admin1234!');

  const { error: tituladoError } = await supabase.auth.admin.createUser({
    email: 'titulado@umss.edu.bo',
    password: 'Titulado1234!',
    app_metadata: { role: 'titulado' },
    email_confirm: true,
  });
  if (tituladoError) console.error('Error creando titulado:', tituladoError.message);
  else console.log('Usuario titulado creado: titulado@umss.edu.bo / Titulado1234!');
}

seed();