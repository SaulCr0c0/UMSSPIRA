'use client';

import { useState } from 'react';
import { Lock, Globe, MapPin, Phone, Mail, Save, Pencil } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { Company, UpdateCompanyPayload } from '@umsspira/shared-types';

interface EditCompanyFormProps {
  company: Company;
  onCancel: () => void;
  onSubmit: (data: UpdateCompanyPayload) => Promise<void>;
}

const MAX_DESCRIPTION_LENGTH = 2000;

const TAMANO_OPTIONS = [
  '1-10 empleados',
  '11-50 empleados',
  '50-200 empleados',
  '200+ empleados',
];

export function EditCompanyForm({ company, onCancel, onSubmit }: EditCompanyFormProps) {
  const [formData, setFormData] = useState<Company>(company);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof Company, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripcion es obligatoria';

    if (formData.descripcion.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.descripcion = `Maximo ${MAX_DESCRIPTION_LENGTH} caracteres`;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!emailRegex.test(formData.correo)) {
      newErrors.correo = 'Correo invalido';
    }

    const phoneRegex = /^\+?[0-9\s-]{7,}$/;
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El telefono es obligatorio';
    } else if (!phoneRegex.test(formData.telefono)) {
      newErrors.telefono = 'Telefono invalido';
    }

    const urlRegex = /^https?:\/\/.+\..+/;
    if (!formData.sitioWeb.trim()) {
      newErrors.sitioWeb = 'El sitio web es obligatorio';
    } else if (!urlRegex.test(formData.sitioWeb)) {
      newErrors.sitioWeb = 'Debe iniciar con http:// o https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { id, nit, ...payload } = formData;
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: string) => {
    const value = formData[field as keyof Company] as string;
    return cn(
      'w-full pl-9 pr-3 py-2 border rounded-md text-sm leading-[22px] text-abyssal focus:outline-none focus:ring-2 focus:ring-burning-flame/40',
      errors[field]
        ? 'border-red-500'
        : value && value.trim()
        ? 'border-green-500'
        : 'border-gray-300'
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Pencil className="w-5 h-5 text-burning-flame" />
        <h2 className="text-2xl font-semibold text-abyssal leading-[30px]">
          Editar perfil de la empresa
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NIT/RUC - bloqueado */}
        <div>
          <label className="text-[13px] font-semibold text-abyssal leading-[18px]">
            NIT / RUC <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <input
              type="text"
              value={formData.nit}
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm leading-[22px] text-gray-500 cursor-not-allowed"
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <p className="text-[11px] leading-[14px] text-gray-500 mt-1">No editable</p>
        </div>

        {/* Tamano */}
        <div>
          <label className="text-[13px] font-semibold text-abyssal leading-[18px]">
            Tamano de la empresa <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.tamano}
            onChange={(e) => handleChange('tamano', e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-sm leading-[22px] text-abyssal focus:outline-none focus:ring-2 focus:ring-burning-flame/40"
          >
            {TAMANO_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Sitio web */}
        <div>
          <label className="text-[13px] font-semibold text-abyssal leading-[18px]">
            Sitio web <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.sitioWeb}
              onChange={(e) => handleChange('sitioWeb', e.target.value)}
              className={inputClass('sitioWeb')}
            />
          </div>
          {errors.sitioWeb && (
            <p className="text-[11px] leading-[14px] text-red-500 mt-1">{errors.sitioWeb}</p>
          )}
        </div>

        {/* Ubicacion */}
        <div>
          <label className="text-[13px] font-semibold text-abyssal leading-[18px]">
            Ubicacion <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              className={inputClass('direccion')}
            />
          </div>
        </div>

        {/* Descripcion */}
        <div className="md:col-span-2">
          <label className="text-[13px] font-semibold text-abyssal leading-[18px]">
            Descripcion <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => {
              if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                handleChange('descripcion', e.target.value);
              }
            }}
            rows={4}
            className={cn(
              'w-full px-3 py-2 mt-1 border rounded-md resize-none text-sm leading-[22px] text-abyssal focus:outline-none focus:ring-2 focus:ring-burning-flame/40',
              errors.descripcion ? 'border-red-500' : 'border-gray-300'
            )}
          />
          <div className="flex justify-between mt-1">
            {errors.descripcion ? (
              <p className="text-[11px] leading-[14px] text-red-500">{errors.descripcion}</p>
            ) : (
              <span />
            )}
            <p className="text-[11px] leading-[14px] text-gray-500">
              {formData.descripcion.length}/{MAX_DESCRIPTION_LENGTH}
            </p>
          </div>
        </div>

        {/* Contacto */}
        <div className="md:col-span-2">
          <label className="text-[13px] font-semibold text-abyssal leading-[18px]">
            Contacto <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
            <div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  placeholder="+591 71234567"
                  className={inputClass('telefono')}
                />
              </div>
              {errors.telefono && (
                <p className="text-[11px] leading-[14px] text-red-500 mt-1">{errors.telefono}</p>
              )}
            </div>
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.correo}
                  onChange={(e) => handleChange('correo', e.target.value)}
                  placeholder="contacto@empresa.com"
                  className={inputClass('correo')}
                />
              </div>
              {errors.correo && (
                <p className="text-[11px] leading-[14px] text-red-500 mt-1">{errors.correo}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2 bg-oatmeal text-abyssal text-sm font-semibold tracking-[0.5px] rounded-md hover:opacity-90 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2 bg-burning-flame text-white text-sm font-semibold tracking-[0.5px] rounded-md hover:opacity-90 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}