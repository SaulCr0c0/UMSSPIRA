import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

// Comparte la conexión PostgreSQL con los módulos del backend, incluida
// Experiencia Laboral, sin crear pools duplicados.
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
