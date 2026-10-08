import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { resolve } from 'path';

/**
 * La API lee un archivo de entorno:
 *   - (por defecto) `.env`                -> proyecto de Supabase / local
 *   - SUPABASE_ENV=local `.env.localstack` -> stack Docker local
 */
const usarStackLocal = process.env.SUPABASE_ENV === 'local';
const envPath = resolve(process.cwd(), usarStackLocal ? '.env.localstack' : '.env');

try {
  // Carga nativa de Node.js 20+ sin depender del paquete externo 'dotenv'
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envPath);
  }
} catch {
  // Si el archivo no existe, continúa con las variables ya exportadas en el entorno
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.WEB_ORIGIN || 'http://localhost:3001',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();