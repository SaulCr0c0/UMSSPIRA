import {
  BadRequestException,
  ConflictException,
  GoneException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { redisClient } from '../../../shared/lib/redis';
import { RegistrationsRepository } from '../repositories/registrations.repository';
import { CreateRegistrationDataDto } from '../contracts/dto';

const SESSION_TTL_SECONDS = 2 * 60 * 60; 
const sessionKey = (token: string) => `registration-session:${token}`;

export const EXPIRED_MESSAGE =
  'El tiempo para completar tu registro venció. Debes llenar el formulario desde el inicio.';

@Injectable()
export class RegistrationsService {
  constructor(private readonly registrationsRepository: RegistrationsRepository) {}

  async listCareers() {
    return this.registrationsRepository.listCareers();
  }

  async createRegistrationSession(dto: CreateRegistrationDataDto) {
    const correo = dto.correo.toLowerCase();
    const complementoCi = dto.complementoCi ?? '';

    await this.assertCareerExists(dto.carreraId);

    const identityMatch = await this.registrationsRepository.findActiveApplicationByIdentity(
      dto.ci,
      complementoCi,
      dto.expedidoEn,
    );
    if (identityMatch) {
      this.conflict('ci', 'El documento de identidad ingresado ya cuenta con una solicitud registrada');
    }

    const emailMatch = await this.registrationsRepository.findActiveApplicationByEmail(correo);
    if (emailMatch) {
      this.conflict('correo', 'Este correo electrónico ya está registrado en otra solicitud');
    }

    const sisMatch = await this.registrationsRepository.findActiveApplicationBySisCode(dto.codigoSis);
    if (sisMatch) {
      this.conflict('codigoSis', 'Este Código SIS ya está registrado en otra solicitud');
    }

    const sessionToken = randomUUID();
    try {
      await redisClient.set(
        sessionKey(sessionToken),
        JSON.stringify({ ...dto, correo, complementoCi, isEmailVerified: false }),
        'EX',
        SESSION_TTL_SECONDS,
      );
    } catch {
      throw new ServiceUnavailableException('No se pudo guardar el registro, intenta nuevamente');
    }
    return { sessionToken, expiresInSeconds: SESSION_TTL_SECONDS };
  }

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
    } catch {
      throw new ServiceUnavailableException('No se pudo consultar el registro, intenta nuevamente');
    }
  }

  private conflict(field: string, message: string): never {
    throw new ConflictException({ statusCode: 409, message, field, errors: [{ field, message }] });
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
}