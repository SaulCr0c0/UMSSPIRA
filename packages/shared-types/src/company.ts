// packages/shared-types/src/company.ts

export interface Company {
  id: string;
  nombre: string;
  nit: string;
  descripcion: string;
  telefono: string;
  correo: string;
  sitioWeb: string;
  direccion: string;
  tamano: string;
  eslogan?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export type UpdateCompanyPayload = Omit<Company, 'id' | 'nit'>;