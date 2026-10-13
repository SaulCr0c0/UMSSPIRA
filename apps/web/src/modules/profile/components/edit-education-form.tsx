'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  BackupField,
  EditRecordLayout,
  FormField,
  INPUT_CLASS,
  RecordNotFound,
} from '@/modules/profile/components/edit-record-layout';
import { useProfileStore } from '@/modules/profile/state/profile-store';
import type { EducationRecord } from '@/modules/profile/types/profile-record';

type EducationFormData = {
  institution: string;
  title: string;
  graduationYear: string;
  degree: string;
};

// Mismos grados que el formulario de formación académica de "Completar perfil"
const DEGREES = ['Técnico superior', 'Licenciatura', 'Maestría', 'Doctorado'];

export function EditEducationForm() {
  const { id } = useParams<{ id: string }>();
  const { records } = useProfileStore();
  const education = (records.education as EducationRecord[]).find((record) => record.id === id);

  if (!education) return <RecordNotFound label="formación académica" />;

  return <EditEducationFields key={education.id} education={education} />;
}

function EditEducationFields({ education }: { education: EducationRecord }) {
  const router = useRouter();
  const { updateRecord } = useProfileStore();

  const [formData, setFormData] = useState<EducationFormData>({
    institution: education.institution,
    title: education.title,
    graduationYear: education.graduationYear,
    degree: education.degree,
  });
  const [documentName, setDocumentName] = useState(education.backupFile ?? '');
  const [isNewDocument, setIsNewDocument] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: name === 'graduationYear' ? value.replace(/\D/g, '') : value,
    }));
    setIsSaved(false);
  }

  function handleDocumentChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentName(file.name);
      setIsNewDocument(true);
      setIsSaved(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Frontend solamente: actualiza el estado compartido del perfil. El backend se conectará posteriormente.
    updateRecord('education', {
      ...education,
      institution: formData.institution.trim(),
      title: formData.title.trim(),
      graduationYear: formData.graduationYear,
      degree: formData.degree,
      backupFile: documentName || undefined,
    });
    setIsSaved(true);
  }

  return (
    <EditRecordLayout
      title="Editar formación académica"
      description="Modifica los datos de esta formación académica y guarda los cambios."
      number="01"
      sectionTitle="Formación académica"
      sectionSubtitle="Tu formación académica principal"
      isSaved={isSaved}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/profile/records')}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField id="institution" label="Institución">
          <input id="institution" name="institution" type="text" value={formData.institution} onChange={handleChange} required className={INPUT_CLASS} />
        </FormField>
        <FormField id="title" label="Título">
          <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} required className={INPUT_CLASS} />
        </FormField>
        <FormField id="graduationYear" label="Año de egreso">
          <input
            id="graduationYear"
            name="graduationYear"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            title="Ingresa un año de 4 dígitos"
            value={formData.graduationYear}
            onChange={handleChange}
            required
            className={INPUT_CLASS}
          />
        </FormField>
        <FormField id="degree" label="Grado">
          <select id="degree" name="degree" value={formData.degree} onChange={handleChange} required className={INPUT_CLASS}>
            {DEGREES.map((degree) => (
              <option key={degree} value={degree}>
                {degree}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Un respaldo ya cargado se considera validado; uno nuevo queda en revisión */}
      <BackupField
        documentName={documentName}
        isVerified={Boolean(documentName) && !isNewDocument}
        onDocumentChange={handleDocumentChange}
      />
    </EditRecordLayout>
  );
}
