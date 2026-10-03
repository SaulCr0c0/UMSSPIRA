import { z } from 'zod';

export const EXPEDITION_DEPARTMENTS = ['LP', 'CB', 'SC', 'OR', 'PT', 'TJ', 'CH', 'BE', 'PD', 'EX'] as const;

const nameRegex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ' -]+$/;

export const personalDataSchema = z.object({
  nombres: z.string().trim().min(2, 'Mínimo 2 caracteres').max(45, 'Máximo 45 caracteres').regex(nameRegex, 'Solo letras y espacios'),
  apellidos: z.string().trim().min(2, 'Mínimo 2 caracteres').max(45, 'Máximo 45 caracteres').regex(nameRegex, 'Solo letras y espacios'),
  ci: z.string().trim().regex(/^\d{5,10}$/, 'Debe tener entre 5 y 10 dígitos'),
  complementoCi: z.string().trim().max(2, 'Máximo 2 caracteres'),
  expedidoEn: z.enum(EXPEDITION_DEPARTMENTS, { message: 'Selecciona departamento' }),
  correo: z.string().trim().toLowerCase().email('Correo no válido').max(100),
  telefono: z.string().trim().regex(/^\d{8}$/, 'Debe tener 8 dígitos'),
  carreraId: z.string().min(1, 'Selecciona tu carrera'),
  anioEgreso: z.coerce.number().int().min(1970).max(new Date().getFullYear()),
  codigoSis: z.string().trim().regex(/^\d{6,9}$/, 'Código SIS de 6 a 9 dígitos'),
});

export type PersonalDataValues = z.infer<typeof personalDataSchema>;