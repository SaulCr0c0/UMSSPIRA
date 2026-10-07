import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { redisClient } from '../../../shared/lib/redis';
import { RegistrationsRepository } from '../repositories/registrations.repository';
import { CreateRegistrationDataDto } from '../contracts/dto';

const SESSION_TTL_SECONDS = 2 * 60 * 60; // 2 horas en Redis (CA-01.1 y CA-01.6)

@Injectable()
export class RegistrationsService {
  constructor(private readonly registrationsRepository: RegistrationsRepository) {}

  async listCareers() {
    return this.registrationsRepository.listCareers();
  }

  async createRegistrationSession(dto: CreateRegistrationDataDto) {
    const correo = dto.correo.toLowerCase();
    const complementoCi = dto.complementoCi ?? '';

    // CA-01.4: Verificación de duplicado por C.I.
    const identityMatch = await this.registrationsRepository.findActiveApplicationByIdentity(
      dto.ci,
      complementoCi,
      dto.expedidoEn,
    );
    if (identityMatch) {
      throw new ConflictException('El documento de identidad ingresado ya cuenta con una solicitud registrada');
    }

    // CA-01.4: Verificación de duplicado por Correo
    const emailMatch = await this.registrationsRepository.findActiveApplicationByEmail(correo);
    if (emailMatch) {
      throw new ConflictException('Este correo electrónico ya está registrado en otra solicitud');
    }

    // CA-01.4: Verificación de duplicado por Código SIS
    const sisMatch = await this.registrationsRepository.findActiveApplicationBySisCode(dto.codigoSis);
    if (sisMatch) {
      throw new ConflictException('Este Código SIS ya está registrado en otra solicitud');
    }

    // CA-01.1: Guardar sesión temporal en Redis por 2 horas
    const sessionToken = randomUUID();
    await redisClient.set(
      `registration-session:${sessionToken}`,
      JSON.stringify({ ...dto, correo, complementoCi, isEmailVerified: false }),
      'EX',
      SESSION_TTL_SECONDS,
    );

    return { sessionToken };
  }
}