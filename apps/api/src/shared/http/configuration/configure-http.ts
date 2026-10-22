// apps/api/src/shared/http/configuration/configure-http.ts
import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import { ErrorHandlerFilter } from '../filters/error-handler.filter';

export function configureHttp(app: INestApplication): void {
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });
  app.use(helmet());
  app.use((_request: unknown, response: import('express').Response, next: () => void) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });
  
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-CSRF-Token'],
    credentials: true,
  });

  app.useGlobalFilters(new ErrorHandlerFilter());
}