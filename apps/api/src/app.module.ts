import { Module } from '@nestjs/common';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';

@Module({
  imports: [
    MailModule,
    AuthModule,
    EmailVerificationModule,
  ],

 controllers: [],
  providers: [],
})
export class AppModule {}
