import { Module } from '@nestjs/common';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';
import { ReviewsModule } from './modules/reviews';

@Module({
  imports: [
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