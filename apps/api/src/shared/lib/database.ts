import { Pool } from 'pg';

let pool: Pool | null = null;

/**
 * Obtiene (o crea) el Pool de conexiones a PostgreSQL.
 * Se inicializa lazy para asegurar que las variables de entorno
 * esten cargadas por ConfigModule.
 */
function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL no esta definida en el entorno');
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

/**
 * Helper para ejecutar queries con parametros seguros.
 * Uso: query('SELECT * FROM empresa WHERE id = $1', [empresaId])
 */
export async function query<T = unknown>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}