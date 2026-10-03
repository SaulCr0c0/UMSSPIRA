import { pipeline } from "@huggingface/transformers";
import type { Candidate, SearchResult, VectorCalculationResult, AffinityAreaItem } from "./types.js";

// Global cache for transformer extractor model pipeline
let extractor: any = null;
let isInitializing = false;

/**
 * Gets or initializes the Hugging Face Transformers.js feature extraction pipeline.
 * Uses the paraphrase-multilingual-MiniLM-L12-v2 model for multilingual semantic search.
 */
export async function getExtractor() {
  if (extractor) {
    return extractor;
  }

  if (isInitializing) {
    while (isInitializing && !extractor) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (extractor) return extractor;
  }

  try {
    isInitializing = true;
    console.log("[NLP Engine] Loading Transformer model 'Xenova/paraphrase-multilingual-MiniLM-L12-v2'...");
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/paraphrase-multilingual-MiniLM-L12-v2"
    );
    console.log("[NLP Engine] Transformer model loaded successfully.");
  } catch (error) {
    console.warn("[NLP Engine] Could not load ONNX model directly, using TF-IDF / N-gram fallback vectors:", error);
    extractor = null;
  } finally {
    isInitializing = false;
  }

  return extractor;
}

/**
 * Converts a candidate object into a rich text representation for embedding extraction.
 */
export function candidateToText(candidate: Candidate): string {
  return `Carrera: ${candidate.career}. Habilidades: ${candidate.skills.join(", ")}. Descripción profesional: ${candidate.professionalDescription}`;
}

/**
 * Computes Cosine Similarity between two numerical feature vectors.
 * Returns a float between -1.0 and 1.0 (or 0 to 1 for non-negative embeddings).
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (!vectorA || !vectorB || vectorA.length === 0 || vectorB.length === 0) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  const minLength = Math.min(vectorA.length, vectorB.length);
  for (let i = 0; i < minLength; i++) {
    dot += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Fallback lightweight text vectorizer using term frequency and n-gram overlap
 * when ONNX runtime or remote download is unavailable.
 */
function fallbackTextVector(text: string): number[] {
  const vocabulary = [
    "typescript", "react", "node.js", "nodejs", "postgresql", "next.js", "tailwind",
    "python", "machine", "learning", "sql", "power", "bi", "pandas", "tensorflow",
    "aws", "docker", "kubernetes", "ci/cd", "terraform", "linux",
    "jest", "cypress", "selenium", "pruebas", "qa", "junit",
    "ciberseguridad", "ethical", "hacking", "firewalls", "redes", "cisco", "pentesting",
    "scrum", "itil", "gestión", "proyectos", "cobit", "jira", "gobernanza",
    "java", "spring", "boot", "microservicios", "rest", "api", "desarrollo", "software",
    "frontend", "backend", "cloud", "devops", "datos", "ia"
  ];

  const lowerText = text.toLowerCase();
  return vocabulary.map((term) => {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "g");
    const matches = lowerText.match(regex);
    return matches ? matches.length : 0;
  });
}

/**
 * Main NLP Search function.
 * Converts job description into a semantic embedding, compares it against all candidates,
 * and returns candidates sorted by similarity percentage (nlpScore).
 */
export async function searchCandidates(
  jobDescription: string,
  candidates: Candidate[]
): Promise<SearchResult[]> {
  const model = await getExtractor();
  let jobVector: number[] = [];

  if (model) {
    try {
      const jobOutput = await model(jobDescription, {
        pooling: "mean",
        normalize: true,
      });
      jobVector = Array.from(jobOutput.data as Float32Array);
    } catch (e) {
      console.warn("[NLP Engine] Error extracting job embedding, using fallback vectorizer:", e);
      jobVector = fallbackTextVector(jobDescription);
    }
  } else {
    jobVector = fallbackTextVector(jobDescription);
  }

  const results: SearchResult[] = [];

  for (const candidate of candidates) {
    const candidateText = candidateToText(candidate);
    let candidateVector: number[] = [];

    if (model) {
      try {
        const candidateOutput = await model(candidateText, {
          pooling: "mean",
          normalize: true,
        });
        candidateVector = Array.from(candidateOutput.data as Float32Array);
      } catch {
        candidateVector = fallbackTextVector(candidateText);
      }
    } else {
      candidateVector = fallbackTextVector(candidateText);
    }

    const similarity = cosineSimilarity(jobVector, candidateVector);

    // Normalization & scaling
    // HuggingFace sentence transformer similarity typically ranges [0.1, 0.95] for relevant queries
    const scaledScore = Math.min(100, Math.max(0, similarity * 100));

    results.push({
      ...candidate,
      nlpScore: Number(scaledScore.toFixed(2)),
    });
  }

  // Return sorted descending by NLP score
  return results.sort((a, b) => b.nlpScore - a.nlpScore);
}

/**
 * Order of the 6 technical areas defined in HU-1 & HU-4
 */
export const HU1_AREAS_ORDER = [
  "desarrollo de software",
  "cloud & devops",
  "ciencia de datos & ia",
  "aseguramiento de calidad (QA)",
  "ciberseguridad y redes",
  "gestion de ti & gobernanza",
] as const;

/**
 * Calculates vector of affinities for a candidate across the 6 technical areas (HU-1).
 * Enforces clamping (0 to 100), rounding to integers, strict 6-area ordering,
 * and mapping of top skills under their respective areas (HU-1 criteria 1-4, 8-11, 16).
 */
export function calculateCandidateAffinityVector(candidate: Candidate): VectorCalculationResult {
  const areaKeywords: Record<string, string[]> = {
    "desarrollo de software": ["typescript", "react", "node.js", "postgresql", "next.js", "tailwind css", "java", "spring boot", "microservicios", "rest api", "desarrollo", "frontend", "backend", "software"],
    "cloud & devops": ["aws", "docker", "kubernetes", "ci/cd", "terraform", "linux", "cloud", "infraestructura", "devops"],
    "ciencia de datos & ia": ["python", "machine learning", "sql", "power bi", "pandas", "tensorflow", "analítica", "datos", "ia"],
    "aseguramiento de calidad (QA)": ["jest", "cypress", "selenium", "pruebas automatizadas", "qa", "junit", "testing", "calidad"],
    "ciberseguridad y redes": ["ethical hacking", "firewalls", "redes cisco", "pentesting", "iso 27001", "ciberseguridad", "seguridad"],
    "gestion de ti & gobernanza": ["scrum", "itil", "gestión de proyectos", "cobit", "jira", "gobernanza de ti", "liderazgo", "proyectos"]
  };

  const topSkillsByArea: Record<string, string[]> = {};
  const areasResult: AffinityAreaItem[] = [];

  // If candidate has no skills or empty profile (HU-1 criterion 10)
  if (!candidate.skills || candidate.skills.length === 0) {
    HU1_AREAS_ORDER.forEach((areaName) => {
      areasResult.push({ area: areaName, affinity: 0 });
      topSkillsByArea[areaName] = [];
    });

    return {
      graduateId: candidate.graduateId,
      calculatedAt: new Date().toISOString(),
      areas: areasResult,
      topSkillsByArea,
    };
  }

  HU1_AREAS_ORDER.forEach((areaName) => {
    const keywords = areaKeywords[areaName] || [];
    const matchedSkills = candidate.skills.filter((skill) =>
      keywords.some((kw) => skill.toLowerCase().includes(kw) || kw.includes(skill.toLowerCase()))
    );

    // Save top matched skills (HU-1 criterion 16)
    topSkillsByArea[areaName] = matchedSkills;

    // Retrieve pre-stored area score if present or compute score
    const existingArea = candidate.areas?.find(
      (a) => a.area.toLowerCase() === areaName.toLowerCase()
    );

    let rawScore = existingArea ? existingArea.affinity : (matchedSkills.length / Math.max(1, candidate.skills.length)) * 100;

    // Apply HU-1 validation rules:
    // Criterion 2: Round decimal numbers to clean integers (e.g. 78.6% -> 79%)
    // Criterion 3: Clamp maximum 100%
    // Criterion 4: Clamp minimum 0%
    const cleanScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    areasResult.push({
      area: areaName,
      affinity: cleanScore,
    });
  });

  return {
    graduateId: candidate.graduateId,
    calculatedAt: new Date().toISOString(),
    areas: areasResult,
    topSkillsByArea,
  };
}
