import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PerfilModule } from './modules/perfil/perfil.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    PerfilModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
