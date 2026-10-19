import { createDatabaseClient } from '../database-client';
import { seedAccessCatalog } from './access-catalog';

async function seed(): Promise<void> {
  const prisma = createDatabaseClient();
  try {
    await seedAccessCatalog(prisma);
    console.info('Catálogo de acceso preparado; no se crearon cuentas de demostración.');
  } finally {
    await prisma.$disconnect();
  }
}

void seed().catch(() => {
  console.error('No se pudo preparar el catálogo de acceso');
  process.exitCode = 1;
});
