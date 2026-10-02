import { Injectable } from '@nestjs/common';
import { HeaderResponseDto } from './dto/header-response.dto';

@Injectable()
export class CompaniesService {
  /**
   * Obtiene los datos del encabezado del perfil corporativo.
   * En Sprint 1 devuelve datos mock; se conectara a Supabase en una HU posterior.
   */
  async getHeader(empresaId: string): Promise<HeaderResponseDto> {
    return {
      nombre: 'Empresa Demo S.A.',
      eslogan: 'Innovacion para el futuro',
      logoUrl: null,
      bannerUrl: null,
    };
  }
}