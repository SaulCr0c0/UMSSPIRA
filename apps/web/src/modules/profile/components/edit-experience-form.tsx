'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  EditRecordLayout,
  FormField,
  INPUT_CLASS,
  RecordNotFound,
} from '@/modules/profile/components/edit-record-layout';
import { useProfileStore } from '@/modules/profile/state/profile-store';
import type { ExperienceRecord } from '@/modules/profile/types/profile-record';

type ExperienceFormData = {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
};

export function EditExperienceForm() {
  const { id } = useParams<{ id: string }>();
  const { records } = useProfileStore();
  const experience = (records.experience as ExperienceRecord[]).find((record) => record.id === id);

  if (!experience) return <RecordNotFound label="experiencia laboral" />;

  return <EditExperienceFields key={experience.id} experience={experience} />;
}

function EditExperienceFields({ experience }: { experience: ExperienceRecord }) {
  const router = useRouter();
  const { updateRecord } = useProfileStore();

  const [formData, setFormData] = useState<ExperienceFormData>({
    company: experience.company,
    position: experience.position,
    startDate: experience.startDate,
    endDate: experience.endDate,
  });
  // Sin fecha de fin = trabajo actual (igual que en "Completar perfil")
  const [isCurrentJob, setIsCurrentJob] = useState(!experience.endDate);
  const [isSaved, setIsSaved] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setIsSaved(false);
  }

  function handleCurrentJobChange(event: React.ChangeEvent<HTMLInputElement>) {
    setIsCurrentJob(event.target.checked);
    if (event.target.checked) setFormData((current) => ({ ...current, endDate: '' }));
    setIsSaved(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Frontend solamente: actualiza el estado compartido del perfil. El backend se conectará posteriormente.
    updateRecord('experience', {
      ...experience,
      company: formData.company.trim(),
      position: formData.position.trim(),
      startDate: formData.startDate,
      endDate: isCurrentJob ? '' : formData.endDate,
    });
    setIsSaved(true);
  }

  return (
    <EditRecordLayout
      title="Editar experiencia laboral"
      description="Modifica los datos de esta experiencia laboral y guarda los cambios."
      number="02"
      sectionTitle="Experiencia laboral"
      sectionSubtitle="Tu experiencia profesional más relevante"
      isSaved={isSaved}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/profile/records')}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField id="company" label="Empresa">
          <input id="company" name="company" type="text" value={formData.company} onChange={handleChange} required className={INPUT_CLASS} />
        </FormField>
        <FormField id="position" label="Cargo">
          <input id="position" name="position" type="text" value={formData.position} onChange={handleChange} required className={INPUT_CLASS} />
        </FormField>
        <FormField id="startDate" label="Fecha inicio">
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            max={formData.endDate || undefined}
            onChange={handleChange}
            required
            className={INPUT_CLASS}
          />
        </FormField>
        <FormField id="endDate" label="Fecha fin">
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            min={formData.startDate || undefined}
            onChange={handleChange}
            required={!isCurrentJob}
            disabled={isCurrentJob}
            className={INPUT_CLASS}
          />
        </FormField>
      </div>

      <label className="flex w-fit items-center gap-2 text-[13px] text-blue-fantastic">
        <input
          type="checkbox"
          checked={isCurrentJob}
          onChange={handleCurrentJobChange}
          className="h-4 w-4 accent-truffle-trouble"
        />
        Actualmente trabajo aquí
      </label>
    </EditRecordLayout>
  );
}
