import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MentorshipModule } from './modules/mentorship/mentorship.module';
import { EventsModule } from './modules/events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MentorshipModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

