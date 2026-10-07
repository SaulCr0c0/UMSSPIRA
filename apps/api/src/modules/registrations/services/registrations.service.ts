import {
  BadRequestException,
  GoneException,
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { redisClient } from '../../../shared/lib/redis';
import { RegistrationsRepository } from '../repositories/registrations.repository';
import { CreateRegistrationDataDto } from '../contracts/dto';
import { DuplicatesService } from './duplicates.service';

// Vigencia de los datos temporales del formulario en Redis: 2 horas (CA-01.1 y CA-01.6)
export const SESSION_TTL_SECONDS = 2 * 60 * 60;
export const sessionKey = (token: string) => `registration-session:${token}`;

export const EXPIRED_MESSAGE =
  'El tiempo para completar tu registro venció. Debes llenar el formulario desde el inicio.';
export const DATA_SOURCE_UNAVAILABLE_MESSAGE =
  'No se pudo verificar la información en este momento, intenta nuevamente';

@Injectable()
export class RegistrationsService {
  private readonly logger = new Logger(RegistrationsService.name);

  constructor(
    private readonly registrationsRepository: RegistrationsRepository,
    private readonly duplicatesService: DuplicatesService,
  ) {}

  async listCareers() {
    return this.withDataSource(() => this.registrationsRepository.listCareers());
  }

  async createRegistrationSession(dto: CreateRegistrationDataDto) {
    const correo = dto.correo.toLowerCase();
    const complementoCi = dto.complementoCi ?? '';

    await this.withDataSource(async () => {
      await this.assertCareerExists(dto.carreraId);
      await this.duplicatesService.assertNoActiveApplication({
        ci: dto.ci,
        complementoCi,
        expedidoEn: dto.expedidoEn,
        correo,
        codigoSis: dto.codigoSis,
      });
    });

    // CA-01.1: los datos se conservan temporalmente en Redis mientras se verifica el correo
    const sessionToken = randomUUID();
    try {
      await redisClient.set(
        sessionKey(sessionToken),
        JSON.stringify({ ...dto, correo, complementoCi, isEmailVerified: false }),
        'EX',
        SESSION_TTL_SECONDS,
      );
    } catch (error) {
      this.logger.error(`No se pudo guardar la sesion de registro: ${(error as Error).message}`);
      throw new ServiceUnavailableException('No se pudo guardar el registro, intenta nuevamente');
    }
    return { sessionToken, expiresInSeconds: SESSION_TTL_SECONDS };
  }

  // CA-01.6: si la sesion ya no existe en Redis, el registro vencio (410 Gone)
  async getRegistrationSession(token: string) {
    const { raw, ttl } = await this.readSession(sessionKey(token));
    if (!raw) {
      throw new GoneException({ statusCode: 410, message: EXPIRED_MESSAGE });
    }
    return { sessionToken: token, expiresInSeconds: Math.max(ttl, 0) };
  }

  private async readSession(key: string): Promise<{ raw: string | null; ttl: number }> {
    try {
      const raw = await redisClient.get(key);
      const ttl = await redisClient.ttl(key);
      return { raw, ttl };
    } catch (error) {
      this.logger.error(`No se pudo consultar la sesion de registro: ${(error as Error).message}`);
      throw new ServiceUnavailableException('No se pudo consultar el registro, intenta nuevamente');
    }
  }

  private async assertCareerExists(carreraId: string) {
    const careers = await this.registrationsRepository.listCareers();
    if (!careers.some((c) => String(c.id) === carreraId)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Revisa los campos del formulario',
        errors: [{ field: 'carreraId', message: 'Carrera no válida' }],
      });
    }
  }

  /**
   * Ejecuta una consulta a la base de datos. Los errores de negocio (400, 409) se
   * propagan tal cual; cualquier otro fallo (Supabase caido o sin configurar) se
   * registra en el log y se responde con 503 sin exponer detalles internos.
   */
  private async withDataSource<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Fallo al consultar la base de datos: ${(error as Error).message}`);
      throw new ServiceUnavailableException(DATA_SOURCE_UNAVAILABLE_MESSAGE);
    }
  }
}
