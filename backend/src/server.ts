import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  searchCandidates,
  calculateCandidateAffinityVector,
  getExtractor
} from "./nlpEngine.js";
import type { CandidatesData, Candidate } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Path to datos.json
const dataPath = path.join(__dirname, "../data/datos.json");

function loadCandidates(): Candidate[] {
  try {
    const rawData = fs.readFileSync(dataPath, "utf-8");
    const parsedData: CandidatesData = JSON.parse(rawData);
    return parsedData.candidates || [];
  } catch (error) {
    console.error("[Backend Server] Error loading datos.json:", error);
    return [];
  }
}

/*
 * ============================================================
 * INTEGRACIÓN FUTURA - EPIC 2 (Tarea #32)
 * ============================================================
 *
 * Actualmente:
 * - Los candidatos provienen de backend/data/datos.json.
 * - El motor NLP (Transformers.js + Node.js) calcula una similitud semántica local.
 * - HU-1 / HU-4 procesa las 6 áreas técnicas en el orden exacto requerido.
 *
 * Futuramente:
 * - El frontend enviará la descripción del puesto al backend NestJS / Express.
 * - El backend procesará la descripción mediante NLP (feature-extraction).
 * - Se calculará la afinidad de cada candidato contra la oferta de empleo.
 * - Se devolverán los candidatos ordenados con sus porcentajes (nlpScore).
 * - El frontend actualizará el carrusel y el gráfico radar en tiempo real.
 *
 * ============================================================
 */

/**
 * Health check endpoint
 */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Motor NLP Egresados UMSSPIRA", timestamp: new Date() });
});

/**
 * Endpoint: List all candidates
 */
app.get("/api/nlp/candidates", (_req, res) => {
  const candidates = loadCandidates();
  res.json({ candidates });
});

/**
 * Endpoint: Semantic Search using NLP Motor (Transformers.js embeddings + Cosine Similarity)
 */
app.post("/api/nlp/search", async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || typeof jobDescription !== "string") {
      return res.status(400).json({
        error: "Se requiere la propiedad 'jobDescription' en el cuerpo de la petición."
      });
    }

    const candidates = loadCandidates();
    console.log(`[NLP Search] Processing search query: "${jobDescription.substring(0, 60)}..."`);
    const results = await searchCandidates(jobDescription, candidates);

    res.json({
      query: jobDescription,
      total: results.length,
      results
    });
  } catch (error) {
    console.error("[NLP Search Error]:", error);
    res.status(500).json({ error: "Error interno al ejecutar el motor NLP." });
  }
});

/**
 * Endpoint: Get candidate HU-1 Affinity Vector across 6 areas
 */
app.get("/api/nlp/affinity/:id", (req, res) => {
  const { id } = req.params;
  const candidates = loadCandidates();
  const candidate = candidates.find((c) => c.graduateId === id) || candidates[0];

  if (!candidate) {
    return res.status(404).json({ error: "Candidato no encontrado." });
  }

  const affinityResult = calculateCandidateAffinityVector(candidate);
  res.json(affinityResult);
});

/**
 * Endpoint: Calculate dynamic affinity vector for candidate profile
 */
app.post("/api/nlp/calculate-affinity", (req, res) => {
  const candidate: Candidate = req.body;
  if (!candidate || !candidate.graduateId) {
    return res.status(400).json({ error: "Estructura de candidato inválida." });
  }

  const affinityResult = calculateCandidateAffinityVector(candidate);
  res.json(affinityResult);
});

// Pre-initialize NLP model on server startup
getExtractor().then(() => {
  console.log("[NLP Engine] Ready to accept semantic queries.");
});

app.listen(PORT, () => {
  console.log(`🚀 Motor NLP Server corriendo exitosamente en http://localhost:${PORT}`);
  console.log(`- POST http://localhost:${PORT}/api/nlp/search`);
  console.log(`- GET  http://localhost:${PORT}/api/nlp/candidates`);
  console.log(`- GET  http://localhost:${PORT}/api/nlp/affinity/00000000-0000-0000-0000-000000000001`);
});
