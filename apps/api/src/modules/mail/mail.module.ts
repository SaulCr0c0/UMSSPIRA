import { Module } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import {
  MAIL_CONFIG,
  MAIL_TRANSPORTER,
  readMailConfig,
} from './mail.config';
import type { MailConfig } from './mail.config';
import { MailService } from './services/mail.service';

@Module({
  providers: [
    {
      // Proveedor de la configuracion validada
      provide: MAIL_CONFIG,
      useFactory: () => readMailConfig(),
    },
    {
      // Conexion SMTP singleton compartida
      provide: MAIL_TRANSPORTER,
      inject: [MAIL_CONFIG],
      useFactory: (config: MailConfig) =>
        createTransport({
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: config.auth,
        }),
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}