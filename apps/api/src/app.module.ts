import { Module } from '@nestjs/common';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth';
import { RegistrationsModule } from './modules/registrations/registrations.module';

@Module({
  imports: [MailModule, AuthModule, RegistrationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
