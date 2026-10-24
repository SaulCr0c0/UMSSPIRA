import type {
  ObservedApplicationDetail,
  UpdateObservedDataResponse,
} from '@umsspira/shared-types';
import type { UpdateObservedDataUseCaseInput } from '../contracts/registration-inputs';

export const OBSERVED_APPLICATION_PORT = Symbol('OBSERVED_APPLICATION_PORT');

export interface ObservedApplicationPort {
  getObservedApplication(applicationId: string): Promise<ObservedApplicationDetail>;
  updateObservedApplication(
    applicationId: string,
    input: UpdateObservedDataUseCaseInput,
  ): Promise<UpdateObservedDataResponse>;
}
