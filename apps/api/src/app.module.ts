import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MentorshipModule } from './modules/mentorship/mentorship.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MentorshipModule,
  ],
  providers: [],
})
export class AppModule {}