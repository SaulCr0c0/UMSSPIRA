'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Briefcase, Check, Eye, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarraProgreso } from './barra-progreso';
import { SeccionAcordeon } from './seccion-acordeon';
import { FormularioExperiencia, type Experiencia } from './experiencia-laboral';
import { FormacionAcademicaForm, type FormacionAcademica } from './formacion-academica';
import { FormularioCertificaciones, type Certificacion } from './certificaciones';
import { crearFormacion } from '@/modules/profile/services/perfil-api';
import { useProfileStore } from '@/modules/profile/state/profile-store';
import type {
  CertificationRecord,
  EducationRecord,
  ExperienceRecord,
} from '@/modules/profile/types/profile-record';

export function AcordeonPerfil() {
  // Los registros vienen del estado compartido del perfil, así lo agregado aquí aparece en el resumen
  const { records, addEducation, addExperience, addCertification } = useProfileStore();
  const router = useRouter();
  const [avisoBorrador, setAvisoBorrador] = useState(false);
  // Campos con errores sin corregir de cada sección (formación, experiencia, certificaciones)
  const [errores, setErrores] = useState({ formacion: 0, experiencia: 0, certificacion: 0 });
  const [intentoGuardar, setIntentoGuardar] = useState(false);

  const erroresFormacion = useCallback((cantidad: number) => setErrores((e) => ({ ...e, formacion: cantidad })), []);
  const erroresExperiencia = useCallback((cantidad: number) => setErrores((e) => ({ ...e, experiencia: cantidad })), []);
  const erroresCertificacion = useCallback(
    (cantidad: number) => setErrores((e) => ({ ...e, certificacion: cantidad })),
    [],
  );
  const seccionesConErrores = Object.values(errores).filter((cantidad) => cantidad > 0).length;

  function guardarPerfil() {
    if (seccionesConErrores > 0) {
      setIntentoGuardar(true);
      return;
    }
    router.push('/profile');
  }

  useEffect(() => {
    if (!avisoBorrador) return;
    const temporizador = setTimeout(() => setAvisoBorrador(false), 3000);
    return () => clearTimeout(temporizador);
  }, [avisoBorrador]);

  const formaciones = useMemo<FormacionAcademica[]>(
    () =>
      (records.education as EducationRecord[]).map((registro) => ({
        institucion: registro.institution,
        titulo: registro.title,
        anioEgreso: registro.graduationYear,
        grado: registro.degree,
      })),
    [records.education],
  );

  const experiencias = useMemo<Experiencia[]>(
    () =>
      (records.experience as ExperienceRecord[]).map((registro) => ({
        empresa: registro.company,
        cargo: registro.position,
        fechaInicio: registro.startDate,
        fechaFin: registro.endDate || undefined,
      })),
    [records.experience],
  );

  const certificaciones = useMemo<Certificacion[]>(
    () =>
      (records.certification as CertificationRecord[]).map((registro) => ({
        nombre: registro.name,
        entidadEmisora: registro.issuer,
        anioEmision: registro.issueYear,
        grado: registro.degree,
        respaldo: registro.backupFile ? new File([], registro.backupFile) : null,
      })),
    [records.certification],
  );

  const cantidades = [formaciones.length, experiencias.length, certificaciones.length];
  const completas = cantidades.filter((cantidad) => cantidad > 0).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Cabecera con progreso (v3: "Completar Perfil Profesional") */}
      <header className="flex flex-col gap-4 rounded-2xl border border-umss-ink/10 bg-white px-5 py-5 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-umss-navy md:text-[28px]">Completar Perfil Profesional</h1>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-semibold text-umss-terracotta">
              {completas} de 3 secciones completas
            </span>
            {seccionesConErrores > 0 && (
              <span className="rounded-full bg-[#FDECEA] px-3 py-1 text-xs font-bold text-umss-terracotta">
                {seccionesConErrores} {seccionesConErrores === 1 ? 'sección con errores' : 'secciones con errores'}
              </span>
            )}
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-lg border border-umss-navy px-3 py-1.5 text-sm font-semibold text-umss-navy transition hover:bg-umss-cream"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Ver resumen
            </Link>
          </div>
        </div>
        <BarraProgreso completas={completas} total={3} />
      </header>

      {intentoGuardar && seccionesConErrores > 0 && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-umss-terracotta bg-[#FDECEA] px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-umss-terracotta" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-umss-terracotta">No se pudo guardar tu perfil</p>
            <p className="text-[13px] text-umss-navy/80">
              Revisa los campos marcados en rojo en {seccionesConErrores === 1 ? 'la sección' : `las ${seccionesConErrores} secciones`} y
              vuelve a intentarlo.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Tarjeta informativa (v3: "Tu Base de Datos Egresado") */}
        <aside className="flex flex-col gap-4 rounded-2xl border border-umss-ink/10 bg-white p-6 lg:w-[300px] lg:shrink-0">
          <h2 className="text-lg font-bold text-umss-navy">Tu Base de Datos Egresado</h2>
          <p className="text-[13px] leading-[1.5] text-umss-navy/70">
            La información registrada se consolida en un formato estructurado (JSON base) para fines de
            acreditación universitaria y bolsa de empleo oficial de la UMSS.
          </p>
          <div className="flex flex-col gap-3 border-t border-umss-sand pt-4">
            <h3 className="text-sm font-bold uppercase text-umss-navy">¿Por qué es importante?</h3>
            <p className="flex gap-2 text-[13px] text-umss-navy/80">
              <ShieldCheck className="h-4 w-4 shrink-0 text-umss-terracotta" aria-hidden="true" />
              Información certificada directamente por el departamento de posgrado.
            </p>
            <p className="flex gap-2 text-[13px] text-umss-navy/80">
              <Briefcase className="h-4 w-4 shrink-0 text-umss-terracotta" aria-hidden="true" />
              Acceso directo a las ofertas laborales de las empresas aliadas a Jalasoft y UMSS.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">

      <SeccionAcordeon
        numero={1}
        titulo="Formación académica"
        descripcion="Tu formación académica principal"
        cantidad={formaciones.length}
        errores={errores.formacion}
      >
        <FormacionAcademicaForm
          formaciones={formaciones}
          onErroresChange={erroresFormacion}
          onAgregar={async (formacion) => {
            // Solo se agrega al store si la API respondió 201; un 400 o 409 lo maneja el formulario
            const creada = await crearFormacion(formacion);
            addEducation({
              institution: creada.institucion,
              title: creada.titulo,
              graduationYear: String(creada.anioEgreso),
              degree: creada.grado,
            });
          }}
        />
      </SeccionAcordeon>
      <SeccionAcordeon
        numero={2}
        titulo="Experiencia laboral"
        descripcion="Tu experiencia profesional más relevante"
        cantidad={experiencias.length}
        errores={errores.experiencia}
      >
        <FormularioExperiencia
          experiencias={experiencias}
          onErroresChange={erroresExperiencia}
          onAgregar={(experiencia) =>
            addExperience({
              company: experiencia.empresa,
              position: experiencia.cargo,
              startDate: experiencia.fechaInicio,
              endDate: experiencia.fechaFin ?? '',
            })
          }
        />
      </SeccionAcordeon>
      <SeccionAcordeon
        numero={3}
        titulo="Certificaciones"
        descripcion="Credenciales que respaldan tu perfil"
        cantidad={certificaciones.length}
        errores={errores.certificacion}
      >
        <FormularioCertificaciones
          certificaciones={certificaciones}
          onErroresChange={erroresCertificacion}
          onAgregar={(certificacion) =>
            addCertification({
              name: certificacion.nombre,
              issuer: certificacion.entidadEmisora,
              issueYear: certificacion.anioEmision,
              degree: certificacion.grado,
              // Un respaldo recién subido queda en revisión hasta que la administración lo valide
              backupFile: certificacion.respaldo?.name,
              backupVerified: false,
            })
          }
        />
      </SeccionAcordeon>

          {/* Acciones finales (v3) */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={guardarPerfil}
              className="h-12 flex-1 rounded-lg bg-umss-orange text-base font-bold text-umss-ink transition hover:brightness-95"
            >
              Guardar perfil profesional
            </button>
            <button
              type="button"
              onClick={() => setAvisoBorrador(true)}
              className="h-12 rounded-lg border border-umss-sand bg-white px-6 text-sm font-semibold text-umss-navy transition hover:bg-umss-cream"
            >
              Guardar borrador
            </button>
          </div>
        </div>
      </div>

      {avisoBorrador && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-umss-ink px-4 py-3 text-sm font-semibold text-white shadow-lg"
        >
          <Check className="h-4 w-4 text-umss-orange" aria-hidden="true" />
          Borrador guardado
        </div>
      )}
    </div>
  );
}
