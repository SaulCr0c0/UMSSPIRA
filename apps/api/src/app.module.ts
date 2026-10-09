import { Module } from '@nestjs/common';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';
import { ReviewsModule } from './modules/reviews';
import { ConfigModule } from '@nestjs/config';
import { MentorshipModule } from './modules/mentorship/mentorship.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MentorshipModule,
    ReportsModule,
    MailModule,
    AuthModule,
    RegistrationsModule,
    DocumentsModule,
    EmailVerificationModule,
    ReviewsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
