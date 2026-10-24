
/**
 * Asociación entre una palabra clave y un área profesional.
 */
export interface DictionaryAreaAssociation {
  /** Identificador único del área profesional. */
  id: string;

  /** Nombre del área profesional; puede ser nulo si no está disponible. */
  nombre: string | null;

  /** Peso de la asociación de la palabra clave con el área. */
  peso: number;
}

/**
 * Entrada normalizada del diccionario de palabras clave.
 *
 * El extractor NLP solo necesita canonical y aliases para reconocer
 * palabras clave. Por ello, areas es opcional en contextos que solo
 * requieren reconocimiento de términos.
 *
 * El repositorio Prisma incluye las asociaciones de áreas al cargar
 * el diccionario para el cálculo del radar. Si una entrada no tiene
 * asociaciones, proporciona areas como un arreglo vacío.
 */
export interface DictionaryEntry {
  /** Forma canónica de la palabra clave. */
  canonical: string;

  /** Variantes o alias que también permiten reconocer la palabra clave. */
  aliases: string[];

  /**
   * Áreas profesionales asociadas.
   * Puede omitirse si el contexto solo necesita reconocer palabras clave.
   */
  areas?: DictionaryAreaAssociation[];
}
