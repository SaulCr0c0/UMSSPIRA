import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '@umsspira/shared-types';
import { AuthGuard, CurrentUser } from '@/shared/guards';
import { CreateReviewDto } from '../contracts/dto/create-review.dto';
import { ReviewsService } from '../services/reviews.service';

@Controller('api/applications')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':id/review')
  @UseGuards(AuthGuard)
  async createReview(
    @Param('id') applicationId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    // TODO: confirmar que el campo del id sea "id" (ver auth.ts)
    const data = await this.reviewsService.createReview(
      applicationId,
      dto,
      user.id,
    );
    return { data };
  }
}