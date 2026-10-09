import { useSyncExternalStore } from "react";
import type { Application, ApplicationsQuery } from "../services";

export type ApplicationsLoadStatus = "idle" | "loading" | "error" | "ready";

export interface ApplicationState {
  status: ApplicationsLoadStatus;
  items: Application[];
  total: number;
  error: string | null;
  query: ApplicationsQuery;
}

export const initialQuery: ApplicationsQuery = {
  page: 1,
  career: "",
  status: "",
  search: "",
};

const initialState: ApplicationState = {
  status: "idle",
  items: [],
  total: 0,
  error: null,
  query: initialQuery,
};

let state: ApplicationState = initialState;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const applicationStore = {
  getState: () => state,
  setState(partial: Partial<ApplicationState>) {
    state = { ...state, ...partial };
    emit();
  },
  reset() {
    state = initialState;
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useApplicationStore(): ApplicationState {
  return useSyncExternalStore(
    applicationStore.subscribe,
    applicationStore.getState,
    applicationStore.getState,
  );
}