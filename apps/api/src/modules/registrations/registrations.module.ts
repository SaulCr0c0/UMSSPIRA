import { GetDraftDocumentController } from './http/controllers/get-draft-document.controller';
import { Module } from '@nestjs/common';
import { RenewActivationController } from './http/controllers/renew-activation.controller';
import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { registrationsProviders } from './infrastructure/providers/registrations.providers';
import { SmtpOutboxWorker } from './infrastructure/notifications/smtp-outbox.worker';
import { RegistrationTrafficGuard } from './http/guards/registration-traffic.guard';
import { TrustedOriginGuard } from '../../shared/http/auth/guards/trusted-origin.guard';
import { ListRegistrationCareersController } from './http/controllers/list-registration-careers.controller';
import { CreateRegistrationController } from './http/controllers/create-registration.controller';
import { InspectRegistrationController } from './http/controllers/inspect-registration.controller';
import { IssueRegistrationCodeController } from './http/controllers/issue-registration-code.controller';
import { VerifyRegistrationCodeController } from './http/controllers/verify-registration-code.controller';
import { SubmitRegistrationController } from './http/controllers/submit-registration.controller';
import { ActivateRegistrationController } from './http/controllers/activate-registration.controller';
import { VerifyActivationCodeController } from './http/controllers/verify-activation-code.controller';
import { UploadRegistrationDocumentController } from './http/controllers/upload-registration-document.controller';
import { ListApplicationsController } from './http/controllers/list-applications.controller';
import { GetApplicationController } from './http/controllers/get-application.controller';
import { ReviewApplicationController } from './http/controllers/review-application.controller';
import { GetApplicationDocumentLinkController } from './http/controllers/get-application-document-link.controller';
import { GetApplicationDocumentController } from './http/controllers/get-application-document.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    GetDraftDocumentController,
    RenewActivationController,
    ListRegistrationCareersController,
    CreateRegistrationController,
    InspectRegistrationController,
    IssueRegistrationCodeController,
    VerifyRegistrationCodeController,
    SubmitRegistrationController,
    ActivateRegistrationController,
    VerifyActivationCodeController,
    UploadRegistrationDocumentController,
    ListApplicationsController,
    GetApplicationController,
    ReviewApplicationController,
    GetApplicationDocumentLinkController,
    GetApplicationDocumentController,
  ],
  providers: [
    ...registrationsProviders,
    SmtpOutboxWorker,
    RegistrationTrafficGuard,
    TrustedOriginGuard,
  ],
})
export class RegistrationsModule {}
