import {
    BadRequestException,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Patch,
    Post,
    Body,
} from '@nestjs/common';
import { MentorshipEligibilityService } from './mentorship-eligibility.service';
import { MentorEligibilityProfile } from './mentor-eligibility.types';
import { SupabaseService } from '../../shared/lib/supabase';

@Controller('mentorship')
export class MentorshipController {
    constructor(
        private readonly mentorshipEligibilityService: MentorshipEligibilityService,
        private readonly supabaseService: SupabaseService,
    ) {}

    @Get('status')
    getStatus() {
        return { mode: this.supabaseService.isConfigured ? 'supabase' : 'demo' };
    }

    @Get('test-profiles')
    getTestProfiles() {
        return this.supabaseService.getMentorProfiles();
    }

    @Post('test-profiles/reset')
    resetTestProfiles() {
        return this.supabaseService.resetDemoProfiles();
    }

    @Post('eligibility')
    @HttpCode(HttpStatus.OK)
    evaluateEligibility(@Body('profile') profile: MentorEligibilityProfile) {
        if (!profile || typeof profile !== 'object'
            || !profile.personalInfo || !profile.academicInfo || !profile.professionalInfo) {
            throw new BadRequestException('Envía un perfil completo en la propiedad "profile".');
        }
        return this.mentorshipEligibilityService.evaluate(profile);
    }

    @Patch('deactivate/:userId')
    @HttpCode(HttpStatus.OK)
    deactivateMentor(
        @Param('userId') userId: string,
        @Body() body: { profile?: MentorEligibilityProfile; reason?: string },
    ) {
        return this.deactivate(userId, body);
    }

    private async deactivate(
        userId: string,
        body: { profile?: MentorEligibilityProfile; reason?: string },
    ) {
        const storedProfile = await this.supabaseService.getMentorProfile(userId);
        const profile = storedProfile
            ?? (this.supabaseService.isConfigured ? undefined : body.profile);
        if (!profile) {
            throw new NotFoundException('No se encontró el perfil de mentor indicado.');
        }

        const result = this.mentorshipEligibilityService.deactivateMentorRole(profile, {
            userId,
            reason: body.reason,
        });
        await this.supabaseService.deactivateMentor(userId, body.reason, result.retainedSettings);
        return result;
    }
}