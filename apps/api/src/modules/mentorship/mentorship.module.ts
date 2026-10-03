import { Module } from '@nestjs/common';
import { MentorshipEligibilityService } from './mentorship-eligibility.service';
import { MentorshipController } from './mentorship.controller';
import { SupabaseService } from '../../shared/lib/supabase';

@Module({
  controllers: [MentorshipController],
  providers: [MentorshipEligibilityService, SupabaseService],
  exports: [MentorshipEligibilityService],
})
export class MentorshipModule {}