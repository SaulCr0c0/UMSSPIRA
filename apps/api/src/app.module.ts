import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EventsModule } from './modules/events/events.module';
import { MentorshipModule } from './modules/mentorship/mentorship.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    EventsModule,
    MentorshipModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}