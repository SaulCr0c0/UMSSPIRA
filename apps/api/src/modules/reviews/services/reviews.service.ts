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
import { CreateReviewDto } from '../contracts/dto/create-review.dto';
import { ReviewsRepository } from '../repositories/reviews.repository';

// Qué estado le toca a la solicitud según la decisión
const STATUS_BY_DECISION: Record<
  CreateReviewDto['decision'],
  ApplicationStatus
> = {
  APPROVED: 'APPROVED',
  OBSERVED: 'OBSERVED',
  REJECTED: 'REJECTED',
};

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private readonly reviewsRepository: ReviewsRepository) {}

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
      reviewedBy: reviewerId, // auditoría: quién dictaminó
    });

    // TODO(fase 2): efectos secundarios
    // - APPROVED: generar código de activación de 24 h en Redis
    // - Todos: enviar correo al egresado (copia al decanato si dto.notifyDean)
    this.logger.log(
      `Dictamen ${review.decision} registrado para ${applicationId} por ${reviewerId}`,
    );

    return review;
  }
}