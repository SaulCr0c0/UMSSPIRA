// apps/api/src/modules/companies/infrastructure/translators/company.translator.ts
import { Prisma } from '../../../../generated/prisma/client';
import type { UpdateCompanyProfileInput } from '../../application/contracts/update-company-profile.input';

export const companyHeaderSelect = {
  id: true,
  razon_social: true,
  eslogan: true,
  logo_url: true,
  banner_url: true,
} satisfies Prisma.EmpresaSelect;

export const companyContactSelect = {
  id: true,
  correo: true,
  sitio_web: true,
  telefono_empresa_registros: {
    select: { numero: true },
    take: 1,
  },
  direccion_empresa_registros: {
    select: { direccion: true },
    take: 1,
  },
} satisfies Prisma.EmpresaSelect;

export const companyProfileSelect = {
  id: true,
  razon_social: true,
  nit: true,
  descripcion: true,
  correo: true,
  sitio_web: true,
  tamano_empresa: true,
  descripcion_larga: true,
  eslogan: true,
  logo_url: true,
  banner_url: true,
} satisfies Prisma.EmpresaSelect;

// 👇 Tipamos el parámetro usando Prisma.EmpresaGetPayload
export function toCompanyHeader(record: Prisma.EmpresaGetPayload<{ select: typeof companyHeaderSelect }>) {
  return {
    id: record.id,
    legalName: record.razon_social,
    slogan: record.eslogan,
    logoUrl: record.logo_url,
    bannerUrl: record.banner_url,
  };
}

export function toCompanyContact(record: Prisma.EmpresaGetPayload<{ select: typeof companyContactSelect }>) {
  return {
    id: record.id,
    email: record.correo,
    website: record.sitio_web,
    phone: record.telefono_empresa_registros?.[0]?.numero || null,
    address: record.direccion_empresa_registros?.[0]?.direccion || null,
  };
}

export function toCompany(record: Prisma.EmpresaGetPayload<{ select: typeof companyProfileSelect }>) {
  return {
    id: record.id,
    legalName: record.razon_social,
    taxId: record.nit,
    description: record.descripcion,
    email: record.correo,
    website: record.sitio_web,
    companySize: record.tamano_empresa,
    longDescription: record.descripcion_larga,
    slogan: record.eslogan,
    logoUrl: record.logo_url,
    bannerUrl: record.banner_url,
  };
}

// 👇 Usamos UpdateCompanyProfileInput en lugar de 'any'
export function toCompanyUpdate(
  input: UpdateCompanyProfileInput,
  now: Date
): Prisma.EmpresaUpdateInput {
  // Hacemos un cast interno a un objeto genérico para acceder a las propiedades opcionales
  const inp = input as Record<string, unknown>;
  
  return {
    razon_social: inp.legalName as string || inp.razonSocial as string,
    nit: inp.taxId as string || inp.nit as string,
    descripcion: inp.description as string || inp.descripcion as string,
    correo: inp.email as string || inp.correo as string,
    sitio_web: inp.website as string || inp.sitioWeb as string,
    tamano_empresa: inp.companySize as string || inp.tamanoEmpresa as string,
    descripcion_larga: inp.longDescription as string || inp.descripcionLarga as string,
    eslogan: inp.slogan as string || inp.eslogan as string,
    logo_url: inp.logoUrl as string,
    banner_url: inp.bannerUrl as string,
    fecha_actualizacion: now,
  };
}