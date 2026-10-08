import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { resolve } from 'path';

import { AppModule } from './app.module';

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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Uno o varios origenes separados por coma:
  //   WEB_ORIGIN=https://app.vercel.app,https://preview.vercel.app
  const origenesPermitidos = (
    process.env.WEB_ORIGIN || 'http://localhost:3001'
  )
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origenesPermitidos,
    credentials: true,
  });

  // Las plataformas de despliegue asignan el puerto con PORT: hay que respetarlo.
  const puerto = Number(process.env.PORT ?? 3000);
  await app.listen(puerto);

  console.log(`API ejecutándose en http://localhost:${puerto}`);
}

bootstrap();