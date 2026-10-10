import { Logger } from '@nestjs/common';
import type { ActivationCodeService } from '@/modules/activation/services/activation-code.service';
import type { MailService } from '@/modules/mail/services/mail.service';
import type { CreateReviewDto } from '../contracts/dto/create-review.dto';
import type { ReviewsRepository } from '../repositories/reviews.repository';
import { ReviewsService } from './reviews.service';

// La notificación corre sin bloquear la respuesta: se espera a que termine
const flush = () => new Promise((resolve) => setImmediate(resolve));

const approved = { decision: 'APPROVED' } as CreateReviewDto;
const observed = {
  decision: 'OBSERVED',
  category: 'Documento ilegible',
  note: 'La imagen no se lee con claridad.',
} as CreateReviewDto;
const rejected = {
  decision: 'REJECTED',
  category: 'Trámite duplicado',
  note: 'Ya existe una solicitud aprobada con estos datos.',
} as CreateReviewDto;

describe('ReviewsService: notificaciones del dictamen', () => {
  const applicant = { email: 'titulado@umss.edu.bo', fullName: 'Ana Pérez' };

  let repository: {
    getApplicationStatus: jest.Mock;
    saveReview: jest.Mock;
    getApplicantContact: jest.Mock;
  };
  let activationCode: { issue: jest.Mock };
  let mailService: {
    sendReviewApproved: jest.Mock;
    sendReviewObserved: jest.Mock;
    sendReviewRejected: jest.Mock;
  };
  let service: ReviewsService;

  beforeEach(() => {
    repository = {
      getApplicationStatus: jest.fn().mockResolvedValue('PENDING'),
      saveReview: jest.fn().mockImplementation(async (input) => ({
        id: 'review-1',
        reviewedAt: '2026-10-08T00:00:00.000Z',
        ...input,
      })),
      getApplicantContact: jest.fn().mockResolvedValue(applicant),
    };
    activationCode = { issue: jest.fn().mockResolvedValue('048213') };
    mailService = {
      sendReviewApproved: jest.fn().mockResolvedValue(undefined),
      sendReviewObserved: jest.fn().mockResolvedValue(undefined),
      sendReviewRejected: jest.fn().mockResolvedValue(undefined),
    };
    service = new ReviewsService(
      repository as unknown as ReviewsRepository,
      activationCode as unknown as ActivationCodeService,
      mailService as unknown as MailService,
    );
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Este sprint solo se registra el dictamen: sin correos ni códigos (ver
  // REVIEW_NOTIFICATIONS_ENABLED). El aviso al titulado llega el siguiente sprint.
  it.each([
    ['al aprobar', approved],
    ['al observar', observed],
    ['al rechazar', rejected],
  ])('%s registra el dictamen sin notificar', async (_case, dto) => {
    const review = await service.createReview('app-1', dto, 'admin-1');
    await flush();

    expect(review.applicationId).toBe('app-1');
    expect(activationCode.issue).not.toHaveBeenCalled();
    expect(mailService.sendReviewApproved).not.toHaveBeenCalled();
    expect(mailService.sendReviewObserved).not.toHaveBeenCalled();
    expect(mailService.sendReviewRejected).not.toHaveBeenCalled();
  });

  it('no notifica si la solicitud ya fue dictaminada', async () => {
    repository.getApplicationStatus.mockResolvedValue('APPROVED');

    await expect(service.createReview('app-1', approved, 'admin-1')).rejects.toThrow();
    await flush();

    expect(repository.saveReview).not.toHaveBeenCalled();
    expect(mailService.sendReviewApproved).not.toHaveBeenCalled();
  });
});
