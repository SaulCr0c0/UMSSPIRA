export interface MentorEligibilityProfile {
  userId: string;
  isMentorActive?: boolean;
  mentorSettings?: MentorSettings;
  isGraduate: boolean;
  isVerified: boolean;
  isApproved: boolean;
  hasParticipationRestriction: boolean;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  academicInfo: {
    career: string;
    degree: string;
    graduationYear: number;
  };
  professionalInfo: {
    summary: string;
    yearsExperience: number;
  };
  description: string;
  experienceDescription: string;
}

export type MentorEligibilityIssueCode =
  | 'not_graduate'
  | 'not_verified'
  | 'not_approved'
  | 'participation_restricted'
  | 'mentor_inactive'
  | 'invalid_profile_data'
  | 'profile_incomplete';

export interface MentorEligibilityIssue {
  code: MentorEligibilityIssueCode;
  message: string;
  missingFields?: string[];
}

export interface MentorEligibilityResult {
  eligible: boolean;
  issues: MentorEligibilityIssue[];
}
export interface MentorSettings {
  maxMentees?: number;
  topics?: string[];
  bio?: string;
}

export interface DeactivateMentorInput {
  userId: string;
  reason?: string;
}

export interface DeactivateMentorResult {
  success: boolean;
  message: string;
  userId: string;
  isMentorActive: boolean;
  deactivatedAt: Date;
  retainedSettings: MentorSettings; // Regla 6.1.4: Conserva la configuración previa
}