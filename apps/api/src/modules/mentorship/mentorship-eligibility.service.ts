import { Injectable } from '@nestjs/common';
import {
  DeactivateMentorInput,
  DeactivateMentorResult,
  MentorEligibilityIssue,
  MentorEligibilityProfile,
  MentorEligibilityResult,
  MentorSettings,
} from './mentor-eligibility.types';

@Injectable()
export class MentorshipEligibilityService {
  evaluate(profile: MentorEligibilityProfile): MentorEligibilityResult {
    const issues: MentorEligibilityIssue[] = [];
    const invalidFlags: string[] = [];

    if (profile?.isGraduate === false) {
      issues.push({ code: 'not_graduate', message: 'El usuario debe ser egresado.' });
    } else if (typeof profile?.isGraduate !== 'boolean') {
      invalidFlags.push('Condición de egresado');
    }
    if (profile?.isVerified === false) {
      issues.push({ code: 'not_verified', message: 'El egresado debe estar verificado.' });
    } else if (typeof profile?.isVerified !== 'boolean') {
      invalidFlags.push('Verificación');
    }
    if (profile?.isApproved === false) {
      issues.push({ code: 'not_approved', message: 'El egresado debe estar aprobado.' });
    } else if (typeof profile?.isApproved !== 'boolean') {
      invalidFlags.push('Aprobación');
    }
    if (profile?.hasParticipationRestriction === true) {
      issues.push({
        code: 'participation_restricted',
        message: 'El usuario tiene restricciones para participar como mentor.',
      });
    } else if (typeof profile?.hasParticipationRestriction !== 'boolean') {
      invalidFlags.push('Restricciones de participación');
    }
    if (profile?.isMentorActive === false) {
      issues.push({
        code: 'mentor_inactive',
        message: 'El rol de mentor está desactivado.',
      });
    }

    if (invalidFlags.length > 0) {
      issues.push({
        code: 'invalid_profile_data',
        message: 'Las condiciones de elegibilidad deben tener valores booleanos válidos.',
        missingFields: invalidFlags,
      });
    }

    const missingFields = this.getMissingProfileFields(profile);
    if (missingFields.length > 0) {
      issues.push({
        code: 'profile_incomplete',
        message: 'Completa los datos mínimos del perfil para habilitarte como mentor.',
        missingFields,
      });
    }

    return { eligible: issues.length === 0, issues };
  }

  private getMissingProfileFields(profile: MentorEligibilityProfile): string[] {
    const personalInfo = profile?.personalInfo;
    const academicInfo = profile?.academicInfo;
    const professionalInfo = profile?.professionalInfo;
    const requiredText: Array<[string, unknown]> = [
      ['Nombre', personalInfo?.firstName],
      ['Apellido', personalInfo?.lastName],
      ['Correo electrónico', personalInfo?.email],
      ['Teléfono', personalInfo?.phone],
      ['Carrera', academicInfo?.career],
      ['Grado académico', academicInfo?.degree],
      ['Resumen profesional', professionalInfo?.summary],
      ['Descripción del perfil', profile?.description],
      ['Descripción de experiencia', profile?.experienceDescription],
    ];

    const missing = requiredText
      .filter(([, value]) => typeof value !== 'string' || !value.trim())
      .map(([label]) => label);

    for (const [label, value] of [['Nombre', personalInfo?.firstName], ['Apellido', personalInfo?.lastName]] as Array<[string, unknown]>) {
      if (typeof value === 'string' && value.trim()
        && (!/\p{L}/u.test(value) || /\d/u.test(value))) {
        missing.push(`${label} válido (no uses números)`);
      }
    }

    const phone = personalInfo?.phone;
    if (typeof phone === 'string' && phone.trim()
      && (!/^[+\d\s().-]+$/.test(phone) || phone.replace(/\D/g, '').length < 7)) {
      missing.push('Teléfono válido');
    }

    const graduationYear = academicInfo?.graduationYear;
    if (typeof graduationYear !== 'number' || !Number.isInteger(graduationYear)
      || graduationYear < 1950 || graduationYear > new Date().getFullYear()) {
      missing.push('Año de egreso');
    }

    const yearsExperience = professionalInfo?.yearsExperience;
    if (typeof yearsExperience !== 'number' || !Number.isFinite(yearsExperience)
      || yearsExperience < 0 || yearsExperience > 80) {
      missing.push('Años de experiencia');
    }

    const email = personalInfo?.email;
    if (typeof email === 'string' && email.trim()
      && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      missing.push('Correo electrónico válido');
    }

    return [...new Set(missing)];
  }

  /*
    Tarea #23: Servicio de desactivación del rol de mentor
    Cumple con la Regla 6.1.4 (Conserva el historial/configuración)
   */
  deactivateMentorRole(
    profile: MentorEligibilityProfile,
    input: DeactivateMentorInput,
  ): DeactivateMentorResult {
    // Preserva la configuración previa del usuario sin borrarla
    const retainedSettings: MentorSettings = {
      ...profile.mentorSettings,
      bio: profile.mentorSettings?.bio ?? profile.description,
    };

    return {
      success: true,
      message: 'La participación como mentor ha sido desactivada. Se ha conservado tu configuración previa.',
      userId: input.userId,
      isMentorActive: false,
      deactivatedAt: new Date(),
      retainedSettings,
    };
  }
}