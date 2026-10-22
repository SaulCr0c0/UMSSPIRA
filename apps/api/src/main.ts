// apps/api/src/main.ts
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureHttp } from './shared/http/configuration/configure-http';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Configura CORS, Helmet, prefijos, filtros, etc.
  configureHttp(app);
  
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port, '0.0.0.0');
  Logger.log(`API ejecutándose en el puerto ${port}`, 'Arranque');
}

void bootstrap().catch(() => {
  Logger.error(
    'No se pudo iniciar la API. Revisa la configuración del entorno.',
    'Arranque',
  );
  process.exitCode = 1;
});