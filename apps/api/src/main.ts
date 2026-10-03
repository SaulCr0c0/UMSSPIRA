import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Permite peticiones desde Next.js
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, stopAtFirstError: true }));
  await app.listen(3000);
}
bootstrap();
