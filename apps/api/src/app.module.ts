import { Module } from '@nestjs/common';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';

@Module({
  imports: [
    MailModule, 
    AuthModule, 
    RegistrationsModule, 
    DocumentsModule,
    EmailVerificationModule,
  ],

 controllers: [],
  providers: [],
})
export class AppModule {}
