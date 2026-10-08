import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type {
  ApplicationStatus,
  ReviewResponse,
} from '@umsspira/shared-types';
import { ActivationCodeService } from '../../activation';
import { MailService } from '../../mail/services/mail.service';
import {
  CreateReviewDto,
  type ReviewCategory,
} from '../contracts/dto/create-review.dto';
import { ReviewsRepository } from '../repositories/reviews.repository';

const STATUS_BY_DECISION: Record<
  CreateReviewDto['decision'],
  ApplicationStatus
> = {
  APPROVED: 'APPROVED',
  OBSERVED: 'OBSERVED',
  REJECTED: 'REJECTED',
};

// Etiquetas legibles para el correo al egresado
const CATEGORY_LABEL: Record<ReviewCategory, string> = {
  DATOS_INCORRECTOS: 'Datos incorrectos',
  DOC_ILEGIBLE: 'Documento ilegible',
  DOC_VENCIDO: 'Documento vencido',
  DOC_NO_CORRESPONDE: 'El documento no corresponde',
  FALTA_FIRMA_SELLO: 'Falta firma o sello',
  INFO_NO_COINCIDE: 'La información no coincide',
  OTRO: 'Otro',
};

// Vigencia del código de activación (CA-04.4)
const ACTIVATION_EXPIRES_IN_HOURS = 24;

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly activationCodeService: ActivationCodeService,
    private readonly mailService: MailService,
  ) {}

  async createReview(
    applicationId: string,
    dto: CreateReviewDto,
    reviewerId: string,
  ): Promise<ReviewResponse> {
    const currentStatus =
      await this.reviewsRepository.getApplicationStatus(applicationId);

    if (!currentStatus) {
      throw new NotFoundException('La solicitud no existe.');
    }

    // Solo se dictamina lo "Pendiente de validación" (CA-04.4)
    if (currentStatus !== 'PENDING') {
      throw new ConflictException(
        'La solicitud ya fue dictaminada y no admite otro dictamen.',
      );
    }

    const isApproval = dto.decision === 'APPROVED';

    const review = await this.reviewsRepository.saveReview({
      applicationId,
      decision: dto.decision,
      status: STATUS_BY_DECISION[dto.decision],
      category: isApproval ? null : (dto.category ?? null),
      note: isApproval ? null : (dto.note ?? null),
      reviewedBy: reviewerId,
    });

    // El dictamen ya quedó guardado: si fallan los efectos, no se deshace
    await this.notifyApplicant(applicationId, dto);

    this.logger.log(
      `Dictamen ${review.decision} registrado para ${applicationId} por ${reviewerId}`,
    );

    return review;
  }

  private async notifyApplicant(
    applicationId: string,
    dto: CreateReviewDto,
  ): Promise<void> {
    try {
      const contact =
        await this.reviewsRepository.getApplicantContact(applicationId);

      if (!contact) {
        this.logger.warn(
          `Sin contacto para notificar la solicitud ${applicationId}`,
        );
        return;
      }

      const to = contact.email;
      const fullName = contact.fullName;

      if (dto.decision === 'APPROVED') {
        const code = await this.activationCodeService.issue(applicationId);
        await this.mailService.sendReviewApproved({
          to,
          fullName,
          code,
          expiresInHours: ACTIVATION_EXPIRES_IN_HOURS,
        });
        return;
      }

      // Para OBSERVED y REJECTED el DTO ya garantiza categoría y nota
      const note = dto.note ?? '';
      const reason = dto.category
        ? `${CATEGORY_LABEL[dto.category]}: ${note}`
        : note;

      if (dto.decision === 'OBSERVED') {
        await this.mailService.sendReviewObserved({
          to,
          fullName,
          observation: reason,
        });
      } else {
        await this.mailService.sendReviewRejected({
          to,
          fullName,
          justification: reason,
        });
      }
      // TODO: copia al decanato si dto.notifyDean (MailService aún no lo soporta)
    } catch (error) {
      this.logger.error(
        `Dictamen guardado, pero falló la notificación de ${applicationId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}