import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MentorshipModule } from './modules/mentorship/mentorship.module';
import { PerfilModule } from './modules/perfil/perfil.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MentorshipModule,
    PerfilModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
