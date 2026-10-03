'use client';

import { useState } from 'react';
//import { X } from 'lucide-react';
import { Pagination } from '../../../../../modules/reports/components/paginacion';
import { FileSpreadsheet, Printer, X } from 'lucide-react';
import {
  ExpedientesTable,
  type GraduateRecord,
} from '@/modules/reports/components/expedientes-table';

// TODO: reemplazar MOCK_DATA por la respuesta del endpoint y mapearla al tipo GraduateRecord.
const MOCK_DATA: GraduateRecord[] =[
  {
    id: 1,
    registrationNumber: 'EXP-2024-001',
    fullName: 'Camila Andrea Rojas Flores',
    sisCode: '201804321',
    phone: '71723456',
    email: 'camila.rojas@example.com',
    admissionDate: '12/02/2018',
    graduationDate: '18/12/2023',
    studyDuration: '5 años, 10 meses',
    reviewDate: '14/03/2024',
    status: 'Verificado',
    rejectionReason: '',
  },
  {
    id: 2,
    registrationNumber: 'EXP-2024-002',
    fullName: 'Diego Marcelo Vargas Quiroga',
    sisCode: '201703158',
    phone: '70345678',
    email: 'diego.vargas@example.com',
    admissionDate: '06/02/2017',
    graduationDate: '21/11/2023',
    studyDuration: '6 años, 9 meses',
    reviewDate: '18/03/2024',
    status: 'Observado',
    rejectionReason:
      'El certificado de notas no cuenta con la firma de la unidad académica.',
  },
  {
    id: 3,
    registrationNumber: 'EXP-2024-003',
    fullName: 'Valeria Sofía Méndez Salazar',
    sisCode: '201905672',
    phone: '69456781',
    email: 'valeria.mendez@example.com',
    admissionDate: '11/02/2019',
    graduationDate: '15/12/2023',
    studyDuration: '4 años, 10 meses',
    reviewDate: '20/03/2024',
    status: 'Verificado',
    rejectionReason: '',
  },
  {
    id: 4,
    registrationNumber: 'EXP-2024-004',
    fullName: 'Javier Esteban Arce Molina',
    sisCode: '201602947',
    phone: '72234567',
    email: 'javier.arce@example.com',
    admissionDate: '08/02/2016',
    graduationDate: '30/06/2023',
    studyDuration: '7 años, 4 meses',
    reviewDate: '22/03/2024',
    status: 'Observado',
    rejectionReason:
      'La copia del documento de identidad es ilegible. Adjunte una imagen nítida de ambas caras.',
  },
  {
    id: 5,
    registrationNumber: 'EXP-2024-005',
    fullName: 'Natalia Fernanda López Rocha',
    sisCode: '201805439',
    phone: '76432109',
    email: 'natalia.lopez@example.com',
    admissionDate: '05/02/2018',
    graduationDate: '12/12/2023',
    studyDuration: '5 años, 10 meses',
    reviewDate: '25/03/2024',
    status: 'Verificado',
    rejectionReason: '',
  },
  {
    id: 6,
    registrationNumber: 'EXP-2024-006',
    fullName: 'Andrés Felipe Gutiérrez Soria',
    sisCode: '201704816',
    phone: '68123450',
    email: 'andres.gutierrez@example.com',
    admissionDate: '13/02/2017',
    graduationDate: '19/12/2023',
    studyDuration: '6 años, 10 meses',
    reviewDate: '27/03/2024',
    status: 'Observado',
    rejectionReason:
      'La fecha de ingreso registrada no coincide con la certificación académica presentada.',
  },
  {
    id: 7,
    registrationNumber: 'EXP-2024-007',
    fullName: 'María José Fernández Torrico',
    sisCode: '201906284',
    phone: '75981234',
    email: 'maria.fernandez@example.com',
    admissionDate: '04/02/2019',
    graduationDate: '20/12/2023',
    studyDuration: '4 años, 10 meses',
    reviewDate: '02/04/2024',
    status: 'Verificado',
    rejectionReason: '',
  },
  {
    id: 8,
    registrationNumber: 'EXP-2024-008',
    fullName: 'Pablo Ignacio Céspedes Ríos',
    sisCode: '201603721',
    phone: '71456789',
    email: 'pablo.cespedes@example.com',
    admissionDate: '10/02/2016',
    graduationDate: '14/07/2023',
    studyDuration: '7 años, 5 meses',
    reviewDate: '05/04/2024',
    status: 'Observado',
    rejectionReason:
      'Falta adjuntar el respaldo del acta de defensa de grado.',
  },
  {
    id: 9,
    registrationNumber: 'EXP-2024-009',
    fullName: 'Lucía Alejandra Paredes Méndez',
    sisCode: '201807193',
    phone: '69876543',
    email: 'lucia.paredes@example.com',
    admissionDate: '12/02/2018',
    graduationDate: '08/12/2023',
    studyDuration: '5 años, 10 meses',
    reviewDate: '08/04/2024',
    status: 'Verificado',
    rejectionReason: '',
  },
  {
    id: 10,
    registrationNumber: 'EXP-2024-010',
    fullName: 'Santiago Nicolás Salinas Daza',
    sisCode: '201705902',
    phone: '77765432',
    email: 'santiago.salinas@example.com',
    admissionDate: '07/02/2017',
    graduationDate: '22/12/2023',
    studyDuration: '6 años, 10 meses',
    reviewDate: '10/04/2024',
    status: 'Observado',
    rejectionReason:
      'El formulario de registro debe estar firmado por el solicitante.',
  },
  {
  id: 11,
  registrationNumber: 'EXP-2024-003',
  fullName: 'María Fernanda Salazar Pérez',
  sisCode: '201905672',
  phone: '76451239',
  email: 'maria.salazar@example.com',
  admissionDate: '04/02/2019',
  graduationDate: '15/12/2024',
  studyDuration: '5 años, 10 meses',
  reviewDate: '20/03/2025',
  status: 'Verificado',
  rejectionReason: '',
},
{
  id: 12,
  registrationNumber: 'EXP-2024-004',
  fullName: 'Luis Fernando Méndez Cabrera',
  sisCode: '201803947',
  phone: '72234567',
  email: 'luis.mendez@example.com',
  admissionDate: '12/02/2018',
  graduationDate: '08/11/2023',
  studyDuration: '5 años, 9 meses',
  reviewDate: '22/03/2024',
  status: 'Observado',
  rejectionReason:
    'La documentación presentada no cuenta con la certificación correspondiente.',
},
{
  id: 13,
  registrationNumber: 'EXP-2024-005',
  fullName: 'Valeria Nicole Fernández Soto',
  sisCode: '202001845',
  phone: '75987654',
  email: 'valeria.fernandez@example.com',
  admissionDate: '03/02/2020',
  graduationDate: '19/12/2024',
  studyDuration: '4 años, 10 meses',
  reviewDate: '25/03/2025',
  status: 'Verificado',
  rejectionReason: '',
},
{
  id: 14,
  registrationNumber: 'EXP-2024-006',
  fullName: 'Jorge Andrés Paredes Molina',
  sisCode: '201704526',
  phone: '70123489',
  email: 'jorge.paredes@example.com',
  admissionDate: '06/02/2017',
  graduationDate: '14/12/2023',
  studyDuration: '6 años, 10 meses',
  reviewDate: '27/03/2024',
  status: 'Observado',
  rejectionReason:
    'Existe una inconsistencia entre la fecha de egreso registrada y la documentación presentada.',
},
{
  id: 15,
  registrationNumber: 'EXP-2024-007',
  fullName: 'Sofía Alejandra Torrico Vargas',
  sisCode: '201906734',
  phone: '71765432',
  email: 'sofia.torrico@example.com',
  admissionDate: '11/02/2019',
  graduationDate: '20/12/2024',
  studyDuration: '5 años, 10 meses',
  reviewDate: '01/04/2025',
  status: 'Verificado',
  rejectionReason: '',
},
{
  id: 16,
  registrationNumber: 'EXP-2024-008',
  fullName: 'Carlos Eduardo Ríos Zambrana',
  sisCode: '201805291',
  phone: '73456781',
  email: 'carlos.rios@example.com',
  admissionDate: '05/02/2018',
  graduationDate: '10/12/2023',
  studyDuration: '5 años, 10 meses',
  reviewDate: '03/04/2024',
  status: 'Observado',
  rejectionReason:
    'Falta adjuntar la copia legalizada del certificado de conclusión de estudios.',
},
{
  id: 17,
  registrationNumber: 'EXP-2024-009',
  fullName: 'Daniela Paola Gutiérrez Arias',
  sisCode: '202002316',
  phone: '76890123',
  email: 'daniela.gutierrez@example.com',
  admissionDate: '10/02/2020',
  graduationDate: '16/12/2024',
  studyDuration: '4 años, 10 meses',
  reviewDate: '05/04/2025',
  status: 'Verificado',
  rejectionReason: '',
},
{
  id: 18,
  registrationNumber: 'EXP-2024-010',
  fullName: 'Miguel Ángel Choque Condori',
  sisCode: '201705843',
  phone: '70987612',
  email: 'miguel.choque@example.com',
  admissionDate: '13/02/2017',
  graduationDate: '22/11/2023',
  studyDuration: '6 años, 9 meses',
  reviewDate: '08/04/2024',
  status: 'Observado',
  rejectionReason:
    'El historial académico presenta asignaturas pendientes de validación.',
},
  {
  id: 19,
  registrationNumber: 'EXP-2024-011',
  fullName: 'Andrea Lucía Villarroel Pinto',
  sisCode: '201907428',
  phone: '75123468',
  email: 'andrea.villarroel@example.com',
  admissionDate: '07/02/2019',
  graduationDate: '13/12/2024',
  studyDuration: '5 años, 10 meses',
  reviewDate: '10/04/2025',
  status: 'Verificado',
  rejectionReason: '',
  },
  {
  id: 20,
  registrationNumber: 'EXP-2024-012',
  fullName: 'Rodrigo Sebastián Camacho León',
  sisCode: '201806915',
  phone: '72345690',
  email: 'rodrigo.camacho@example.com',
  admissionDate: '08/02/2018',
  graduationDate: '17/11/2023',
  studyDuration: '5 años, 9 meses',
  reviewDate: '12/04/2024',
  status: 'Observado',
  rejectionReason:
    'La solicitud requiere la actualización de los datos personales registrados.',
  },
];

/* ============================================================
   MODAL
   ============================================================ */

function ObservationModal({
  record,
  onClose,
}: {
  record: GraduateRecord;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="observation-modal-title"
        aria-modal="true"
        className="w-full max-w-xl rounded-lg bg-white shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">
              Dictamen de expediente
            </p>

            <h2
              id="observation-modal-title"
              className="mt-1 text-xl font-bold text-slate-900"
            >
              Expediente de Observación y Motivos de Rechazo
            </h2>
          </div>

          <button
            aria-label="Cerrar modal"
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Egresado
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {record.fullName}
            </p>

            <p className="text-sm text-slate-500">
              Código SIS: {record.sisCode}
            </p>
          </div>

          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-red-800">
              Motivos de rechazo
            </p>

            <p className="mt-2 leading-relaxed text-red-950">
              {record.rejectionReason}
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button
            className="rounded-md bg-[#1e293b] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            onClick={onClose}
            type="button"
          >
            Cerrar Dictamen
          </button>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   PÁGINA DE EXPEDIENTES
   ============================================================ */

export default function ExpedientesPage() {
  const [selectedRecord, setSelectedRecord] =
    useState<GraduateRecord | null>(null);

  /*
   * Página actual.
   */
  const [currentPage, setCurrentPage] = useState(1);

  /*
   * Límite de filas por página.
   */
  const itemsPerPage = 10;

  /*
   * Datos.
   */
  const records = MOCK_DATA;

  /*
   * Cálculo de los registros que se mostrarán
   * en la página actual.
   */
  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const paginatedRecords =
    records.slice(startIndex, endIndex);

  return (
    <main className="min-h-screen bg-[#f4f1ea] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* Colocar aquí los filtros y conectar su estado cuando esa parte esté asignada. */}

        <section
          aria-labelledby="page-title"
          className="space-y-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Administración / Reportes / Expedientes
              </p>

              <h2
                id="page-title"
                className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl"
              >
                Vista General de Titulados
              </h2>

              {/* Actualizar el título según el estado seleccionado al integrar los filtros. */}

              <p className="mt-2 text-sm text-slate-600">
                {records.length} expedientes registrados
              </p>
            </div>

            {/* El equipo responsable puede añadir aquí las acciones de exportación CSV/PDF. */}
          </div>

          {/* ====================================================
              TABLA
              ==================================================== */}

          <ExpedientesTable
            onViewReason={setSelectedRecord}
            records={paginatedRecords}
          />

          {/* ====================================================
              PAGINACIÓN
              ==================================================== */}

          <Pagination
            currentPage={currentPage}
            totalItems={records.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </section>
      </div>

      {/* ========================================================
          MODAL
          ======================================================== */}

      {selectedRecord && (
        <ObservationModal
          onClose={() => setSelectedRecord(null)}
          record={selectedRecord}
        />
      )}
    </main>
  );
}