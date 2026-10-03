import { GraduateCsvRecord } from '../types/graduate-csv-record.type';

export type GraduateReportStatus = 'verificado' | 'observado';

export interface GraduateReportFilters {
  status: GraduateReportStatus;
  career?: string;
  search?: string;
}

export interface GraduateReportDataSource {
  findAll(filters: GraduateReportFilters): GraduateCsvRecord[];
}

export const GRADUATE_REPORT_DATA_SOURCE = 'GRADUATE_REPORT_DATA_SOURCE';
