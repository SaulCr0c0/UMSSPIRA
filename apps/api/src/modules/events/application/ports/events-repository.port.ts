import type { ActorContext } from '../../../../shared/security/contexts/actor-context';
import type { StoredFile } from '../../../../shared/files/contracts/uploaded-file';
import type { Event } from '../../domain/entities/event';
import type { CreateEventInput, EventInput } from '../contracts/event-inputs';

export const EVENTS_REPOSITORY = Symbol('EVENTS_REPOSITORY');

export interface EventsRepository {
  catalog(): Promise<Event[]>;
  published(id: string): Promise<Event>;
  owned(ownerId: string): Promise<Event[]>;
  findOwned(ownerId: string, id: string): Promise<Event>;
  create(ownerId: string, input: CreateEventInput): Promise<Event>;
  updateDraft(ownerId: string, id: string, input: EventInput): Promise<Event>;
  publishDraft(ownerId: string, id: string): Promise<Event>;
  cancelPublished(ownerId: string, id: string): Promise<Event>;
  saveCover(ownerId: string, file: StoredFile): Promise<void>;
  removeCover(ownerId: string, id: string): Promise<void>;
  readCover(id: string, actor?: ActorContext): Promise<StoredFile>;
}
