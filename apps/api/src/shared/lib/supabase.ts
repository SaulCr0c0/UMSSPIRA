import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
	MentorEligibilityProfile,
	MentorSettings,
} from '../../modules/mentorship/mentor-eligibility.types';

type StoredMentor = {
	usuario_id: string;
	esta_activo: boolean;
	esta_verificado: boolean;
	esta_aprobado: boolean;
	tiene_restriccion: boolean;
	perfil: Omit<MentorEligibilityProfile, 'userId' | 'isGraduate' | 'isVerified' | 'isApproved' | 'hasParticipationRestriction'>;
	configuracion: MentorSettings;
};

const demoProfiles: MentorEligibilityProfile[] = [
	{
		userId: '30000000-0000-4000-8000-000000000001',
		isMentorActive: true,
		mentorSettings: { maxMentees: 3, topics: ['Backend', 'Bases de datos'], bio: 'Mentora de sistemas distribuidos.' },
		isGraduate: true,
		isVerified: true,
		isApproved: true,
		hasParticipationRestriction: false,
		personalInfo: { firstName: 'Lucia', lastName: 'Rojas', email: 'lucia.rojas@example.test', phone: '+591 70000001' },
		academicInfo: { career: 'Ingenieria de Sistemas', degree: 'Licenciatura', graduationYear: 2021 },
		professionalInfo: { summary: 'Desarrolladora backend con experiencia en APIs.', yearsExperience: 4 },
		description: 'Mentora de sistemas distribuidos.',
		experienceDescription: 'Experiencia en APIs, PostgreSQL y servicios en la nube.',
	},
	{
		userId: '30000000-0000-4000-8000-000000000002',
		isMentorActive: true,
		mentorSettings: { maxMentees: 2, topics: ['UX'], bio: 'Perfil de prueba incompleto.' },
		isGraduate: true,
		isVerified: true,
		isApproved: true,
		hasParticipationRestriction: false,
		personalInfo: { firstName: 'Mario', lastName: '', email: 'mario.invalid', phone: '' },
		academicInfo: { career: 'Diseno Grafico', degree: '', graduationYear: 0 },
		professionalInfo: { summary: '', yearsExperience: -1 },
		description: '',
		experienceDescription: '',
	},
	{
		userId: '30000000-0000-4000-8000-000000000003',
		isMentorActive: true,
		mentorSettings: { maxMentees: 1, topics: ['Gestion de proyectos'], bio: 'Perfil con restriccion de participacion.' },
		isGraduate: true,
		isVerified: false,
		isApproved: false,
		hasParticipationRestriction: true,
		personalInfo: { firstName: 'Andrea', lastName: 'Vargas', email: 'andrea.vargas@example.test', phone: '+591 70000003' },
		academicInfo: { career: 'Ingenieria Industrial', degree: 'Licenciatura', graduationYear: 2018 },
		professionalInfo: { summary: 'Lider de proyectos.', yearsExperience: 7 },
		description: 'Mentora de gestion de proyectos.',
		experienceDescription: 'Experiencia liderando equipos multidisciplinarios.',
	},
];

@Injectable()
export class SupabaseService {
	private readonly url = process.env.SUPABASE_URL?.replace(/\/$/, '');
	private readonly serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	private readonly demoStatePath = join(__dirname, '../../../.local/mentorship-demo.json');
	private localProfiles = this.loadDemoProfiles();

	get isConfigured(): boolean {
		return Boolean(this.url && this.serviceRoleKey);
	}

	async getMentorProfiles(): Promise<MentorEligibilityProfile[]> {
		if (!this.isConfigured) return this.localProfiles;

		const rows = await this.request<StoredMentor[]>('/rest/v1/mentor?select=*');
		return rows.map((row) => this.mapProfile(row));
	}

	resetDemoProfiles(): MentorEligibilityProfile[] {
		if (this.isConfigured) {
			throw new BadRequestException('El restablecimiento de perfiles solo está disponible en modo demo.');
		}

		this.localProfiles = this.cloneProfiles(demoProfiles);
		this.persistDemoProfiles();
		return this.localProfiles;
	}

	async getMentorProfile(userId: string): Promise<MentorEligibilityProfile | undefined> {
		if (!this.isConfigured) {
			return this.localProfiles.find((profile) => profile.userId === userId);
		}

		const rows = await this.request<StoredMentor[]>(
			`/rest/v1/mentor?select=*&usuario_id=eq.${encodeURIComponent(userId)}&limit=1`,
		);
		return rows[0] ? this.mapProfile(rows[0]) : undefined;
	}

	async deactivateMentor(
		userId: string,
		reason: string | undefined,
		settings: MentorSettings,
	): Promise<void> {
		if (!this.isConfigured) {
			const profile = this.localProfiles.find((candidate) => candidate.userId === userId);
			if (!profile) throw new NotFoundException('No se encontró el perfil de mentor indicado.');
			profile.isMentorActive = false;
			profile.mentorSettings = { ...settings };
			this.persistDemoProfiles();
			return;
		}

		await this.request(
			`/rest/v1/mentor?usuario_id=eq.${encodeURIComponent(userId)}`,
			{
				method: 'PATCH',
				headers: { Prefer: 'return=minimal' },
				body: JSON.stringify({
					esta_activo: false,
					fecha_actualizacion: new Date().toISOString().slice(0, 10),
					motivo_desactivacion: reason ?? null,
					configuracion: settings,
				}),
			},
		);
	}

	private loadDemoProfiles(): MentorEligibilityProfile[] {
		try {
			if (existsSync(this.demoStatePath)) {
				const savedProfiles = JSON.parse(readFileSync(this.demoStatePath, 'utf8')) as MentorEligibilityProfile[];
				const expectedIds = new Set(demoProfiles.map((profile) => profile.userId));
				if (Array.isArray(savedProfiles)
					&& savedProfiles.length === demoProfiles.length
					&& savedProfiles.every((profile) => expectedIds.has(profile.userId))) {
					return savedProfiles;
				}
			}
		} catch {
			// A corrupt local fixture should not prevent the API from starting.
		}

		return this.cloneProfiles(demoProfiles);
	}

	private persistDemoProfiles(): void {
		mkdirSync(dirname(this.demoStatePath), { recursive: true });
		const temporaryPath = `${this.demoStatePath}.${process.pid}.tmp`;
		writeFileSync(temporaryPath, JSON.stringify(this.localProfiles, null, 2), 'utf8');
		renameSync(temporaryPath, this.demoStatePath);
	}

	private cloneProfiles(profiles: MentorEligibilityProfile[]): MentorEligibilityProfile[] {
		return JSON.parse(JSON.stringify(profiles)) as MentorEligibilityProfile[];
	}

	private mapProfile(row: StoredMentor): MentorEligibilityProfile {
		return {
			...row.perfil,
			userId: row.usuario_id,
			isMentorActive: row.esta_activo,
			isGraduate: true,
			isVerified: row.esta_verificado,
			isApproved: row.esta_aprobado,
			hasParticipationRestriction: row.tiene_restriccion,
			mentorSettings: row.configuracion ?? {},
		};
	}

	private async request<T = void>(path: string, init: RequestInit = {}): Promise<T> {
		if (!this.isConfigured) {
			throw new ServiceUnavailableException('Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');
		}

		const response = await fetch(`${this.url}${path}`, {
			...init,
			headers: {
				apikey: this.serviceRoleKey!,
				Authorization: `Bearer ${this.serviceRoleKey}`,
				'Content-Type': 'application/json',
				...init.headers,
			},
		});

		if (!response.ok) {
			const details = await response.text();
			throw new ServiceUnavailableException(`Supabase respondió ${response.status}: ${details}`);
		}
		if (response.status === 204 || response.headers.get('content-length') === '0') {
			return undefined as T;
		}
		const text = await response.text();
		return (text ? JSON.parse(text) : undefined) as T;
	}
}
