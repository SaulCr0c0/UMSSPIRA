import { Module } from '@nestjs/common';
import { ReviewsController } from './controllers/reviews.controller';
import { ReviewsRepository } from './repositories/reviews.repository';
import { ReviewsService } from './services/reviews.service';
import { ActivationModule } from '@/modules/activation/activation.module';
import { MailModule } from '@/modules/mail/mail.module';
@Module({
  imports: [ActivationModule, MailModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
  exports: [ReviewsService],
})
export class ReviewsModule {}