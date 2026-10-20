import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Environment } from '../../../../config/environment';
import { createTransport, type Transporter } from 'nodemailer';
import { z } from 'zod';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { NodeRegistrationSecurity } from '../security/registration-security';

const messageSchema = z.object({ to: z.email(), subject: z.string(), text: z.string() });

@Injectable()
export class SmtpOutboxWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SmtpOutboxWorker.name);
  private timer?: NodeJS.Timeout;
  private transport?: Transporter;
  private running = false;
  private task?: Promise<void>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly security: NodeRegistrationSecurity,
    private readonly config: ConfigService<Environment, true>,
  ) {}

  onModuleInit(): void {
    if (this.config.get('NODE_ENV') === 'test') {
      return;
    }
    this.transport = createTransport({
      url: this.config.get<string>('SMTP_URL', 'smtp://127.0.0.1:1025'),
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
    this.timer = setInterval(() => {
      if (!this.running) {
        this.task = this.drain();
      }
    }, 5000);
    this.timer.unref();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
    }
    await this.task;
    this.transport?.close();
  }

  async drain(): Promise<void> {
    if (this.running || !this.transport) {
      return;
    }
    this.running = true;
    try {
      const rows = await this.prisma.correoPendiente.findMany({
        where: { enviado_en: null, proximo_en: { lte: new Date() }, expira_en: { gt: new Date() } },
        orderBy: { creado_en: 'asc' },
        take: 10,
      });
      for (const row of rows) {
        // La reserva permite varios procesos. SMTP ofrece entrega al menos una vez.
        const claimed = await this.prisma.correoPendiente.updateMany({
          where: {
            id: row.id,
            enviado_en: null,
            proximo_en: { lte: new Date() },
            expira_en: { gt: new Date() },
          },
          data: { proximo_en: new Date(Date.now() + 60000), intentos: { increment: 1 } },
        });
        if (!claimed.count) {
          continue;
        }
        try {
          const mail = messageSchema.parse(this.security.open(row.contenido));
          await this.transport.sendMail({
            from: this.config.get<string>('MAIL_FROM', 'UMSSPIRA <no-reply@umsspira.local>'),
            ...mail,
            messageId: '<' + row.id + '@umsspira.local>',
          });
          // Se elimina el contenido cifrado después de entregar; no se conserva el código.
          await this.prisma.correoPendiente.update({
            where: { id: row.id },
            data: { enviado_en: new Date(), contenido: '' },
          });
        } catch {
          this.logger.warn('No se entregó la notificación ' + row.id + '; se reintentará');
        }
      }
      await this.prisma.correoPendiente.deleteMany({
        where: {
          OR: [
            { expira_en: { lte: new Date() } },
            { enviado_en: { lt: new Date(Date.now() - 86400000) } },
          ],
        },
      });
      await this.prisma.borradorRegistro.deleteMany({
        where: { expira_en: { lte: new Date() }, id_solicitud: null },
      });
    } catch {
      this.logger.warn('No se pudo consultar la cola de correo');
    } finally {
      this.running = false;
    }
  }
}
