import { Module } from '@nestjs/common';
import { DatabaseModule } from './shared/database/database.module';
import { ExperienceModule } from './modules/profile/experiences/experience.module';

@Module({
  imports: [DatabaseModule, ExperienceModule], // Conecta con PostgreSQL las pantallas del perfil; sus datos quedan disponibles para futuras HUs de vacantes.
  controllers: [],
  providers: [],
})
export class AppModule {}
