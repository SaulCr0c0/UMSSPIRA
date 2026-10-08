import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { resolve } from 'path';

/**
 * La API lee UN solo archivo de entorno, elegido asi:
 *   - (por defecto) `.env`          -> proyecto de Supabase en la nube
 *   - SUPABASE_ENV=local `.env.localstack` -> stack local de Docker (respaldo)
 *
 * Ejemplo: `SUPABASE_ENV=local pnpm dev` o `pnpm --filter api dev:local`
 */
const usarStackLocal = process.env.SUPABASE_ENV === 'local';

config({
  path: resolve(process.cwd(), usarStackLocal ? '.env.localstack' : '.env'),
  // Solo con el stack local debe ganarle a `.env`, que ConfigModule tambien
  // intenta cargar. Asi una variable exportada en la terminal sigue valiendo.
  override: usarStackLocal,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
app.enableCors({
    origin: process.env.WEB_ORIGIN || 'http://localhost:3001',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  await app.listen(3000);
}
bootstrap();