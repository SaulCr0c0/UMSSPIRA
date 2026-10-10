import { CURRENT_GRADUATE_ID } from '@/modules/profile/data/profile-records-data';
import type { DeleteRecordErrorCode, ProfileRecord } from '@/modules/profile/types/profile-record';

const MOCK_DELAY_MS = 600;

export class DeleteRecordException extends Error {
  constructor(public readonly code: DeleteRecordErrorCode) {
    super(code === 'forbidden' ? 'Forbidden (403)' : 'Network error');
    this.name = 'DeleteRecordException';
  }
}

// Mock del endpoint DELETE de registros del perfil (el backend se integra en la siguiente fase).
// Reproduce las respuestas que la interfaz debe manejar: sin conexión y registro de otro egresado (403).
export async function deleteProfileRecord(record: ProfileRecord): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new DeleteRecordException('network');
  }
  if (record.ownerId !== CURRENT_GRADUATE_ID) {
    throw new DeleteRecordException('forbidden');
  }
}
