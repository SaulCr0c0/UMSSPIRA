
import type { RadarArea } from '@umsspira/shared-types';
// Define el tipo para los términos del diccionario
export type DictionaryTerm = {
  canonical: string;
  alias: string; // Puede tener 1, 2 o 3 palabras
  wordCount: number;
};

/**
 * Detecta términos de 1 a 3 palabras en un texto normalizado.
 * Regla: La frase más larga prevalece y no se cuenta dos veces.
 */
export const detectTerms = (normalizedText: string, dictionary: DictionaryTerm[]): Record<string, number> => {
  const detectedCounts: Record<string, number> = {};
  
  // 1. Ordenar el diccionario por longitud de palabras (descendente: 3, luego 2, luego 1)
  const sortedDictionary = [...dictionary].sort((a, b) => b.wordCount - a.wordCount);
  
  // Usaremos un string mutable para ir "tachando" lo que ya encontramos
  let remainingText = ` ${normalizedText} `; // Espacios para coincidencia exacta de límites

  // 2. Evaluar cada término ordenado
  for (const term of sortedDictionary) {
    // Escapar caracteres especiales del alias (como +, #, .)
    const escapedAlias = term.alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Crear regex que busque la palabra completa, respetando límites
    // Usamos lookarounds (?<=\s) y (?=\s) para asegurar que coincida con palabras enteras
    const regex = new RegExp(`(?<=\\s)${escapedAlias}(?=\\s)`, 'g');
    
    const matches = remainingText.match(regex);
    
    if (matches && matches.length > 0) {
      // Registrar las ocurrencias usando el nombre canónico
      detectedCounts[term.canonical] = (detectedCounts[term.canonical] || 0) + matches.length;
      
      // "Tachar" el término encontrado reemplazándolo por un marcador (ej. guiones)
      // Esto evita que "machine" se cuente después de encontrar "machine learning"
      remainingText = remainingText.replace(regex, '-'.repeat(term.alias.length));
    }
  }

  // 3. Aplicar el tope máximo de 3 apariciones por keyword según las reglas
  

  return detectedCounts;
};

// --- TAREA T2.2: AGREGACIÓN POR ÁREA EN RADAR ---

// Estructura que Abad (T2.1) nos pasará con las áreas y pesos de cada palabra
export type KeywordMapping = {
  area: RadarArea;
  weight: number;
};

// El diccionario cargado en memoria por el Backend
export type KeywordDictionaryMap = Record<string, KeywordMapping[]>;

/**
 * Calcula los puntos acumulados por área.
 * Regla de negocio: peso × min(count, 3)
 */
export const aggregateRadarScores = (
  detectedCounts: Record<string, number>,
  keywordMap: KeywordDictionaryMap
): Record<RadarArea, number> => {
  // 1. Inicializar el contador de puntos para las 6 áreas en 0
  const areaScores: Record<RadarArea, number> = {
    'software-development': 0,
    'cloud-devops': 0,
    'data-ai': 0,
    'quality-assurance': 0,
    'cybersecurity-networks': 0,
    'it-management': 0,
  };

  // 2. Recorrer cada palabra encontrada por el detector
  for (const [term, count] of Object.entries(detectedCounts)) {
    // Buscar a qué áreas pertenece esa palabra en el mapa que hizo Abad
    const termMappings = keywordMap[term];

    if (termMappings) {
      // 3. Aplicar el tope máximo de 3 repeticiones según el documento
      const effectiveCount = Math.min(count, 3);

      // 4. Sumar los puntos a cada área a la que pertenece la palabra
      for (const mapping of termMappings) {
        areaScores[mapping.area] += mapping.weight * effectiveCount;
      }
    }
  }

  return areaScores;
};