import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';
import { profileProviders } from './infrastructure/providers/profile.providers';
import { GetProfileController } from './http/controllers/get-profile.controller';
import { CreateEducationController } from './http/controllers/create-education.controller';
import { CreateExperienceController } from './http/controllers/create-experience.controller';
import { CreateCertificationController } from './http/controllers/create-certification.controller';
import { GetProfileRecordController } from './http/controllers/get-profile-record.controller';
import { UpdateProfileRecordController } from './http/controllers/update-profile-record.controller';
import { DeleteProfileRecordController } from './http/controllers/delete-profile-record.controller';
import { ReadCertificationBackupController } from './http/controllers/read-certification-backup.controller';
import { ExportProfileController } from './http/controllers/export-profile.controller';
import { UploadCertificationBackupController } from './http/controllers/upload-certification-backup.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    GetProfileController,
    CreateEducationController,
    CreateExperienceController,
    CreateCertificationController,
    GetProfileRecordController,
    UpdateProfileRecordController,
    DeleteProfileRecordController,
    ReadCertificationBackupController,
    ExportProfileController,
    UploadCertificationBackupController,
  ],
  providers: profileProviders,
})
export class ProfileModule {}
