import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MentorshipModule } from './modules/mentorship/mentorship.module';
import { PerfilModule } from './modules/perfil/perfil.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MentorshipModule,
    PerfilModule,
  ],
  providers: [],
})
export class AppModule {}
