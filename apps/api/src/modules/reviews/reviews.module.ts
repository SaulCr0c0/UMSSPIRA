import { Module } from '@nestjs/common';
import { ActivationModule } from '../activation';
import { MailModule } from '../mail/mail.module';
import { ReviewsController } from './controllers/reviews.controller';
import { ReviewsRepository } from './repositories/reviews.repository';
import { ReviewsService } from './services/reviews.service';

@Module({
  imports: [ActivationModule, MailModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
  exports: [ReviewsService],
})
export class ReviewsModule {}