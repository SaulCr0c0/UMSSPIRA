import { RadarArea } from '../../domain/entities/radar-area';

/** Datos calculados de un área listos para guardarse en la tabla afinidad_radar */
export interface AreaScoreRecord {
  areaSlug: RadarArea;
  areaId: string;
  puntaje: number;
  porcentaje: number;
  ponderacion: number | null;
  palabrasClaveTop: Array<{ keyword: string; weight: number; frequency: number; points: number; percentage: number; }>;
}

/** Representa una instantánea recuperada de la base de datos de un cálculo previo */
export interface RadarCalculationSnapshot {
  id: string;
  tituladoId: string;
  hashEntrada: string | null;
  estado: 'COMPLETADO' | 'VACIO';
  versionAlgoritmo: string;
  fechaCalculo: Date;
  afinidad: Array<{
    areaId: string;
    puntaje: number;
    porcentaje: number;
    ponderacion: number | null;
    palabrasClaveTop: Array<{ keyword: string; weight: number; frequency: number; points: number; percentage: number; }>;
  }>;
}

// Token de inyección de dependencias para NestJS
export const RADAR_REPOSITORY_PORT = Symbol('RadarRepositoryPort');

export interface RadarRepositoryPort {
  /** Obtiene el cálculo más reciente del titulado para comprobar hash o servir en GET */
  getLatestCalculation(tituladoId: string): Promise<RadarCalculationSnapshot | null>;

  /** Obtiene el cálculo anterior para rellenar el campo previousAffinity y mostrar variación (+8%, -3%) */
  getPreviousCalculation(tituladoId: string, currentCalculationId: string): Promise<RadarCalculationSnapshot | null>;

  /**
   * Ejecuta una operación bajo un bloqueo asesor a nivel de transacción (pg_advisory_xact_lock).
   * Evita condiciones de carrera si el usuario hace doble clic en 'Recalcular'.
   */
  executeWithAdvisoryLock<T>(tituladoId: string, operation: () => Promise<T>): Promise<T>;

  /**
   * Guarda de forma atómica en una transacción:
   * 1 fila en calculo_radar + 6 filas en afinidad_radar + sincronización en palabra_clave_no_mapeada
   */
  saveCalculation(params: {
    tituladoId: string;
    hashEntrada: string;
    estado: 'COMPLETADO' | 'VACIO';
    versionAlgoritmo: string;
    areas: AreaScoreRecord[];
    unmapped: Array<{ term: string; count: number }>;
  }): Promise<RadarCalculationSnapshot>;

  /** Carga todos los pesos configurados por área desde la tabla palabra_clave_area */
  getAreaWeights(): Promise<Record<string, Array<{ term: string; peso: number }>>>;
}