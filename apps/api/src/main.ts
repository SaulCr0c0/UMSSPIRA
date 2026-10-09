import './load-env';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppExceptionFilter } from './shared/filters/app-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Uno o varios origenes separados por coma:
  //   WEB_ORIGIN=https://app.vercel.app,https://preview.vercel.app
  const origenesPermitidos = (process.env.WEB_ORIGIN || 'http://localhost:3001')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origenesPermitidos,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AppExceptionFilter());

  // Las plataformas de despliegue asignan el puerto con PORT: hay que respetarlo.
  await app.listen(Number(process.env.PORT ?? 3000));
}
bootstrap();
