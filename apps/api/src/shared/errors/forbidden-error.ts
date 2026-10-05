// apps/api/src/shared/errors/forbidden-error.ts
import { AppError } from './app-error';

export class ForbiddenError extends AppError {
  constructor(message = 'No tienes permisos para acceder a este recurso') {
    super(message, 'FORBIDDEN', 403);
  }
}