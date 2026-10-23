
/** Relación de una palabra clave con un área profesional. */
export interface DictionaryAreaAssociation {
  id: string;
  nombre: string | null;
  peso: number;
}

/** Una entrada del diccionario, normalizada y asociada a sus áreas. */
export interface DictionaryEntry {
  canonical: string;
  aliases: string[];
  areas?: DictionaryAreaAssociation[];
}
