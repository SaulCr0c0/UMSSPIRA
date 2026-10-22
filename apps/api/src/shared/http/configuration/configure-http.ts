import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import type { Environment } from '../../../config/environment';
import { ErrorHandlerFilter } from '../filters/error-handler.filter';

export function configureHttp(app: INestApplication): void {
  const config = app.get(ConfigService<Environment, true>);
  // 👇 Volvemos a leer la lista de orígenes permitidos desde el .env
  const origins = config.get('CORS_ORIGINS', { infer: true });

  app.setGlobalPrefix('api/v1', { exclude: ['health'] });
  app.use(helmet());
  app.use((_request: unknown, response: import('express').Response, next: () => void) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });

  // 👇 Restringimos CORS: solo los orígenes configurados pueden pasar
  app.enableCors({
    origin: (origin, callback) => {
      // Si no hay origin (como en peticiones internas o server-to-server), permitimos
      if (!origin) {return callback(null, true);}
      // Si el origin está en la lista, permitimos
      if (origins.includes(origin)) {return callback(null, true);}
      // Si no está, bloqueamos
      callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-CSRF-Token'],
    credentials: true,
  });

  app.useGlobalFilters(new ErrorHandlerFilter());
}