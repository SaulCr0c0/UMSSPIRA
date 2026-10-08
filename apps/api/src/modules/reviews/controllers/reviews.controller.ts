import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '@umsspira/shared-types';
import { AuthGuard, CurrentUser, RolesGuard } from '@/shared/guards';
import { Roles } from '@/shared/guards/roles.decorator';
import { CreateReviewDto } from '../contracts/dto/create-review.dto';
import { ReviewsService } from '../services/reviews.service';

@Controller('api/applications')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':id/review')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('administrador')
  async createReview(
    @Param('id', ParseUUIDPipe) applicationId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.reviewsService.createReview(
      applicationId,
      dto,
      user.id,
    );
    return { data };
  }
}