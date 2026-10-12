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
          // Sin estos límites, un servidor de correo inalcanzable mantiene la
          // petición colgada ~2 minutos (timeout por defecto de nodemailer).
          connectionTimeout: 10_000,
          greetingTimeout: 10_000,
          socketTimeout: 20_000,
        }),
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}