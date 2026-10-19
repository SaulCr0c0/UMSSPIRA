import { config } from 'dotenv';
import { resolve } from 'node:path';
import type { Prisma } from '../../src/generated/prisma/client';
import { Argon2PasswordHasher } from '../../src/modules/auth/infrastructure/security/argon2-password.hasher';
import { createDatabaseClient } from '../database-client';
import { seedAccessCatalog } from './access-catalog';
import { assertDemoEnvironment } from './demo-environment';
import {
  DEMO_ACCOUNTS,
  DEMO_ADMIN_ASSIGNMENT_ID,
  DEMO_CAREER_ID,
  DEMO_COMPANY_ID,
  DEMO_GRADUATE_ID,
  type DemoAccount,
} from './demo-accounts';

function profileFor(account: DemoAccount): Partial<Prisma.UsuarioCreateInput> {
  if (account.role === 'titulado') {
    return {
      titulado: {
        create: {
          id: DEMO_GRADUATE_ID,
          nombre: 'Titulado',
          apellido: 'de demostración',
          carrera: { connect: { id: DEMO_CAREER_ID } },
        },
      },
    };
  }
  if (account.role === 'empresa') {
    return {
      empresa_registros: {
        create: {
          id: DEMO_COMPANY_ID,
          razon_social: 'Empresa de demostración',
          correo: account.email,
        },
      },
    };
  }
  return {
    administrador_de_carrera_registros: {
      create: {
        id: DEMO_ADMIN_ASSIGNMENT_ID,
        estado: 'ACTIVO',
        carrera: { connect: { id: DEMO_CAREER_ID } },
      },
    },
  };
}

async function seedDemo(): Promise<void> {
  config({ path: resolve(__dirname, '../../.env'), quiet: true });
  assertDemoEnvironment(process.env);
  const prisma = createDatabaseClient();
  try {
    await seedAccessCatalog(prisma);
    const passwords = new Argon2PasswordHasher();
    const accounts = await Promise.all(
      DEMO_ACCOUNTS.map(async (account) => ({
        ...account,
        hash: await passwords.hash(account.password),
      })),
    );

    await prisma.$transaction(
      async (tx) => {
        const roleCodes = accounts.map((account) => account.role);
        const roles = await tx.rolAcceso.findMany({
          where: { codigo: { in: roleCodes }, habilitado: true },
        });
        if (roles.length !== roleCodes.length) {
          throw new Error('Hay roles de demostración deshabilitados');
        }

        await tx.carrera.upsert({
          where: { id: DEMO_CAREER_ID },
          create: { id: DEMO_CAREER_ID, nombre: 'Carrera de demostración' },
          update: {},
        });

        for (const account of accounts) {
          const existing = await tx.usuario.findUnique({ where: { correo: account.email } });
          if (existing && existing.usuario_id !== account.id) {
            throw new Error('Un correo de demostración ya pertenece a otra cuenta');
          }
          if (existing) {
            continue;
          }

          await tx.usuario.create({
            data: {
              ...profileFor(account),
              usuario_id: account.id,
              correo: account.email,
              nombre: account.name,
              rol: account.role,
              estado: 'ACTIVO',
              cuenta_acceso: { create: { password_hash: account.hash } },
            },
          });
        }
      },
      { timeout: 30_000 },
    );

    console.info(
      'Cuentas de demostración preparadas; las cuentas existentes conservaron sus datos y contraseñas.',
    );
  } finally {
    await prisma.$disconnect();
  }
}

void seedDemo().catch((error: unknown) => {
  const message =
    error instanceof Error && error.message.startsWith('El seed de demostración')
      ? error.message
      : 'No se pudo poblar la demostración. Revisa migraciones, roles y posibles conflictos de cuentas.';
  console.error(message);
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    /^[A-Z0-9_]+$/.test(error.code)
  ) {
    console.error(`Código de diagnóstico: ${error.code}`);
  }
  process.exitCode = 1;
});
