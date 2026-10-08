import {
  Injectable,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Pool, type QueryResult, type QueryResultRow } from 'pg';

// Centraliza el pool del driver `pg`; el API se conecta al PostgreSQL publicado
// por Docker en localhost:5432 y usa DATABASE_URL si se configura.
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const password = process.env.POSTGRES_PASSWORD;

    // Evita arrancar con una conexión incompleta o una contraseña simulada.
    if (!connectionString && !password) {
      throw new Error('Configura DATABASE_URL o POSTGRES_PASSWORD en el archivo .env.');
    }

    this.pool = new Pool({
      ...(connectionString
        ? { connectionString }
        : {
            host: process.env.PGHOST || 'localhost',
            port: Number(process.env.PGPORT || 5432),
            database: process.env.PGDATABASE || 'postgres',
            user: process.env.PGUSER || 'postgres',
            password,
          }),
      connectionTimeoutMillis: 5000,
      max: 10,
    });
  }

  // Ejecuta consultas parametrizadas para mantener segura la integración con
  // experiencia_laboral y permitir que otras HUs reutilicen esos datos.
  async query<Row extends QueryResultRow>(
    text: string,
    values: (string | number | boolean | null)[] = [],
  ): Promise<QueryResult<Row>> {
    try {
      return await this.pool.query<Row>(text, values);
    } catch (error) {
      if (this.isConnectionError(error)) {
        throw new ServiceUnavailableException(
          'No se pudo conectar con PostgreSQL. Comprueba que Docker esté activo y que las variables de conexión sean correctas.',
          { cause: error },
        );
      }

      throw error;
    }
  }

  // Libera las conexiones del pool cuando Nest detiene el backend.
  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  // Solo convierte fallos conocidos de transporte en un 503; los errores SQL
  // inesperados siguen visibles para no esconder fallos de implementación.
  private isConnectionError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return false;
    }

    const code = String(error.code);
    return (
      code.startsWith('08') ||
      ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', '57P01'].includes(code)
    );
  }
}
