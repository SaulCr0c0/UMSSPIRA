import { Module } from '@nestjs/common';
import { CompaniesModule } from './modules/companies/companies.module';
import { JobPostingsModule } from './modules/job-postings/job-postings.module';
import { HealthController } from './health.controller';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';
import { ReviewsModule } from './modules/reviews';
import { ConfigModule } from '@nestjs/config';

import { EventsModule } from './modules/events/events.module';
import { MentorshipModule } from './modules/mentorship/mentorship.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    CompaniesModule,
    JobPostingsModule,
    EventsModule,
    MentorshipModule,
    ReportsModule,
    MailModule,
    AuthModule,
    RegistrationsModule,
    DocumentsModule,
    EmailVerificationModule,
    ReviewsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
