import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth';

@Module({
  imports: [AuthModule], // CompaniesModule y JobPostingsModule se agregan cuando sus equipos los completen
  controllers: [],
  providers: [],
})
export class AppModule {}