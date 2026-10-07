import { Injectable } from '@nestjs/common';
import { query } from '../../shared/lib/database';
import { CrearFormacionAcademicaDto } from './dto/crear-formacion-academica.dto';
import { FormacionRepositorio } from './formacion-academica.service';
import {
  COLUMNAS_RESPALDO,
  COLUMNA_FECHA_CREACION,
  COLUMNA_ID,
  COLUMNA_TITULADO,
  SECCIONES,
  Seccion,
  TABLA_RESPALDO,
  TipoRespaldo,
} from './perfil.constants';
import {
  PerfilCompleto,
  Registro,
  Respaldo,
  datosAColumnas,
  filaARegistro,
  filaARespaldo,
} from './perfil.mappers';
import { FormacionComparable } from './validators/formacion-duplicada';

// Único archivo que habla con la BD. Los nombres de tabla y columna salen de perfil.constants.ts
// y los valores van siempre como parámetros ($1, $2...), nunca dentro del texto del SQL.
@Injectable()
export class PerfilRepository implements FormacionRepositorio {
  async insertar(seccion: Seccion, tituladoId: string, datos: object): Promise<Registro> {
    const { tabla } = SECCIONES[seccion];
    const { columnas, valores } = datosAColumnas(seccion, datos);
    const todas = [COLUMNA_TITULADO, ...columnas, COLUMNA_FECHA_CREACION];
    const marcadores = [...columnas, COLUMNA_TITULADO].map((_, i) => `$${i + 1}`);
    const sql =
      `INSERT INTO ${tabla} (${todas.join(', ')}) ` +
      `VALUES (${marcadores.join(', ')}, NOW()) RETURNING *`;
    const filas = await query<Record<string, unknown>>(sql, [tituladoId, ...valores]);
    return filaARegistro(seccion, filas[0]);
  }

  async listar(seccion: Seccion, tituladoId: string): Promise<Registro[]> {
    const { tabla } = SECCIONES[seccion];
    const sql =
      `SELECT * FROM ${tabla} WHERE ${COLUMNA_TITULADO} = $1 ` +
      `ORDER BY ${COLUMNA_FECHA_CREACION} DESC NULLS LAST`;
    const filas = await query<Record<string, unknown>>(sql, [tituladoId]);
    return filas.map((fila) => filaARegistro(seccion, fila));
  }

  async obtenerPorId(seccion: Seccion, id: string): Promise<Registro | null> {
    const { tabla } = SECCIONES[seccion];
    const filas = await query<Record<string, unknown>>(
      `SELECT * FROM ${tabla} WHERE ${COLUMNA_ID} = $1`,
      [id],
    );
    return filas[0] ? filaARegistro(seccion, filas[0]) : null;
  }

  async actualizar(seccion: Seccion, id: string, datos: object): Promise<Registro> {
    const { tabla } = SECCIONES[seccion];
    const { columnas, valores } = datosAColumnas(seccion, datos);
    const asignaciones = columnas.map((columna, i) => `${columna} = $${i + 2}`);
    const sql = `UPDATE ${tabla} SET ${asignaciones.join(', ')} WHERE ${COLUMNA_ID} = $1 RETURNING *`;
    const filas = await query<Record<string, unknown>>(sql, [id, ...valores]);
    return filaARegistro(seccion, filas[0]);
  }

  async eliminar(seccion: Seccion, id: string): Promise<void> {
    const { tabla } = SECCIONES[seccion];
    await query(`DELETE FROM ${tabla} WHERE ${COLUMNA_ID} = $1`, [id]);
  }

  async obtenerPerfilCompleto(tituladoId: string): Promise<PerfilCompleto> {
    const [formacionAcademica, experienciaLaboral, certificaciones] = await Promise.all([
      this.listar('formacion-academica', tituladoId),
      this.listar('experiencia-laboral', tituladoId),
      this.listar('certificaciones', tituladoId),
    ]);
    return { formacionAcademica, experienciaLaboral, certificaciones };
  }

  async guardarRespaldo(
    certificacionId: string,
    tipo: TipoRespaldo,
    archivoKey: string,
  ): Promise<Respaldo> {
    const c = COLUMNAS_RESPALDO;
    const sql =
      `INSERT INTO ${TABLA_RESPALDO} (${c.idCertificacion}, ${c.tipo}, ${c.archivoKey}, ${c.fechaSubida}) ` +
      `VALUES ($1, $2, $3, NOW()) RETURNING *`;
    const filas = await query<Record<string, unknown>>(sql, [certificacionId, tipo, archivoKey]);
    return filaARespaldo(filas[0]);
  }

  // Contrato FormacionRepositorio (lo usa FormacionAcademicaService para el 409 de T2.5)
  async obtenerPorEgresado(idEgresado: string): Promise<FormacionComparable[]> {
    const registros = await this.listar('formacion-academica', idEgresado);
    return registros as unknown as FormacionComparable[];
  }

  crear(idEgresado: string, datos: CrearFormacionAcademicaDto): Promise<Registro> {
    return this.insertar('formacion-academica', idEgresado, datos);
  }
}
