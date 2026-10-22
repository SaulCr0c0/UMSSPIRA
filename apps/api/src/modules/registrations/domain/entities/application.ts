import type { ApplicationStatus } from './registration';

export interface ApplicationDetail {
  id: string;
  code: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  ci: string;
  issuedIn: string;
  sisCode: string;
  career: string;
  careerId: string | null;
  status: ApplicationStatus;
  submittedAt: string;
  phone: string;
  graduationYear: number | null;
  documentName: string;
  documentPath: string | null;
  documentFormat: string;
}

export interface ApplicationPage {
  items: ApplicationDetail[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ReviewResult {
  id: string;
  applicationId: string;
  decision: Exclude<ApplicationStatus, 'PENDING'>;
  status: Exclude<ApplicationStatus, 'PENDING'>;
  category: string | null;
  note: string | null;
  reviewedBy: string;
  reviewedAt: string;
  notificationStatus: 'QUEUED';
}
