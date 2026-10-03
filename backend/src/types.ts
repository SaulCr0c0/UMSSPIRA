export interface AffinityAreaItem {
  area: string;
  affinity: number;
}

export interface Candidate {
  graduateId: string;
  name: string;
  career: string;
  graduationYear: number;
  skills: string[];
  professionalDescription: string;
  affinity: number;
  featured: boolean;
  areas?: AffinityAreaItem[];
  mayorConcentracion?: string;
  concentrationArea?: string;
}

export interface CandidatesData {
  candidates: Candidate[];
}

export interface SearchResult extends Candidate {
  nlpScore: number;
  mayorConcentracion: string;
  concentrationArea: string;
  breakdown?: {
    careerMatch: number;
    skillsMatch: number;
    descriptionMatch: number;
  };
}

export interface VectorCalculationResult {
  graduateId: string;
  calculatedAt: string;
  areas: AffinityAreaItem[];
  topSkillsByArea: Record<string, string[]>;
}
