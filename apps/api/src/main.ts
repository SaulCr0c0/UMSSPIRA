import './load-env';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, type ArgumentMetadata } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppExceptionFilter } from './shared/filters/app-exception.filter';
import { CreateEventDto } from './modules/events/dto/create-event.dto';
import { UpdateDraftEventDto } from './modules/events/dto/update-draft-event.dto';

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

  const validationPipe = new ValidationPipe({ whitelist: true, transform: true });
  const eventsValidationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  // Conserva la validación estricta de eventos sin cambiar la de las otras épicas.
  app.useGlobalPipes({
    transform(value: unknown, metadata: ArgumentMetadata) {
      const pipe = metadata.metatype === CreateEventDto || metadata.metatype === UpdateDraftEventDto
        ? eventsValidationPipe : validationPipe;
      return pipe.transform(value, metadata);
    },
  });
  app.useGlobalFilters(new AppExceptionFilter());

  // Las plataformas de despliegue asignan el puerto con PORT: hay que respetarlo.
  const puerto = Number(process.env.PORT ?? 3000);
  await app.listen(puerto);

  console.log(`API ejecutándose en http://localhost:${puerto}`);
}
bootstrap();
