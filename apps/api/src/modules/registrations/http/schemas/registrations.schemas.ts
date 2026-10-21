import {
  DEFAULT_APPLICATION_PAGE_SIZE,
  isApplicationPageSize,
} from '../../domain/policies/application-pagination.policy';

import { z } from 'zod';

export const registrationIdSchema = z.uuid();
const nameSchema = z
  .string()
  .trim()
  .min(2)
  .max(45)
  .regex(/^[\p{L}' -]+$/u);
export const documentTypeSchema = z.enum([
  'titulo_provision_nacional',
  'diploma_academico',
  'certificado_egreso',
]);
export const registrationDataSchema = z.strictObject({
  nombres: nameSchema,
  apellidos: nameSchema,
  ci: z
    .string()
    .trim()
    .regex(/^\d{5,10}$/),
  complementoCi: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{0,2}$/)
    .default(''),
  expedidoEn: z.enum(['LP', 'CB', 'SC', 'OR', 'PT', 'TJ', 'CH', 'BE', 'PD', 'EX']),
  correo: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  telefono: z
    .string()
    .trim()
    .regex(/^\d{8}$/),
  carreraId: z.uuid(),
  anioEgreso: z
    .number()
    .int()
    .min(1970)
    .refine((year) => year <= new Date().getFullYear(), 'Año futuro no permitido'),
  codigoSis: z
    .string()
    .trim()
    .regex(/^\d{6,9}$/),
});
export const issueCodeSchema = z.strictObject({ registrationId: z.uuid() });
export const verifyCodeSchema = issueCodeSchema.extend({ code: z.string().regex(/^\d{6}$/) });
export const uploadDocumentSchema = z.strictObject({
  sessionToken: z.uuid(),
  tipoDocumento: documentTypeSchema,
});
export const submitRegistrationSchema = z
  .strictObject({
    sessionToken: z.uuid(),
    fechaTitulacion: z.iso.date().optional(),
    fechaIngreso: z.iso.date().optional(),
    deseaMentor: z.boolean(),
    tipoDocumento: documentTypeSchema,
    rutaStorage: z.uuid(),
    sizeBytes: z
      .number()
      .int()
      .positive()
      .max(5 * 1024 * 1024),
    mimeType: z.enum(['application/pdf', 'image/png', 'image/jpeg']).optional(),
  })
  .superRefine((data, context) => {
    const today = new Date().toISOString().slice(0, 10);
    for (const field of ['fechaTitulacion', 'fechaIngreso'] as const) {
      if (data[field] && data[field]! > today) {
        context.addIssue({
          code: 'custom',
          path: [field],
          message: 'La fecha no puede ser futura',
        });
      }
    }
    if (data.fechaIngreso && data.fechaTitulacion && data.fechaIngreso > data.fechaTitulacion) {
      context.addIssue({
        code: 'custom',
        path: ['fechaIngreso'],
        message: 'Debe ser anterior a la titulación',
      });
    }
  });
export const applicationQuerySchema = z.strictObject({
  page: z.coerce.number().int().positive().max(100000).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .refine(isApplicationPageSize, 'Tamaño de página no permitido')
    .default(DEFAULT_APPLICATION_PAGE_SIZE),
  career: z.string().trim().max(150).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'OBSERVED', 'REJECTED']).optional(),
  search: z.string().trim().max(100).optional(),
  age: z.enum(['within48', 'over48']).optional(),
});
export const reviewSchema = z
  .strictObject({
    decision: z.enum(['APPROVED', 'OBSERVED', 'REJECTED']),
    category: z.string().trim().min(1).max(100).optional(),
    note: z.string().trim().min(10).max(500).optional(),
    notifyDean: z.literal(false).optional(),
  })
  .superRefine((data, context) => {
    if (data.decision !== 'APPROVED') {
      for (const field of ['category', 'note'] as const) {
        if (!data[field]) {
          context.addIssue({
            code: 'custom',
            path: [field],
            message: 'Campo obligatorio para este dictamen',
          });
        }
      }
    }
  });
export const activateAccountSchema = z.strictObject({
  applicationId: z.uuid(),
  code: z.string().regex(/^\d{6}$/),
  password: z.string().min(15).max(128),
});
