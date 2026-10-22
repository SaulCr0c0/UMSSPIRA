// apps/api/src/main.ts
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { Environment } from './config/environment';
import { configureHttp } from './shared/http/configuration/configure-http';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // 🔥 ESTO ES LO QUE ARREGLA EL WEBSOCKET 🔥
  // Permite que el frontend (en el puerto 3001 o 3000) se conecte sin bloqueos de CORS
  app.enableCors({
    origin: true, // Permite cualquier origen en desarrollo (luego lo puedes restringir)
    credentials: true, // Permite el envío de cookies (esencial para tu autenticación)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });

  configureHttp(app);
  app.enableShutdownHooks();
  
  // Lee el puerto desde tu archivo .env
  const port = app.get(ConfigService<Environment, true>).get('PORT', { infer: true });
  
  await app.listen(port, '0.0.0.0');
  Logger.log(`API ejecutándose en el puerto ${port}`, 'Arranque');
}

void bootstrap().catch(() => {
  Logger.error('No se pudo iniciar la API. Revisa la configuración del entorno.', 'Arranque');
  process.exitCode = 1;
});