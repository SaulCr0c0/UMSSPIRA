
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
 * palabras clave, por lo que areas puede omitirse en contextos de extracción.
 *
 * El repositorio Prisma proporciona las áreas asociadas a cada entrada.
 * Si una palabra no tiene asociaciones, areas debe ser un arreglo vacío.
 */
export interface DictionaryEntry {
  /** Forma canónica de la palabra clave. */
  canonical: string;

  /** Variantes o alias que también permiten reconocer la palabra clave. */
  aliases: string[];

  /** Áreas profesionales asociadas; puede omitirse en contextos de extracción. */
  areas?: DictionaryAreaAssociation[];
}
