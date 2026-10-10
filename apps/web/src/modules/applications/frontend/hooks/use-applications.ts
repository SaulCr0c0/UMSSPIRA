"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { applicationStore, initialQuery, useApplicationStore } from "../store";
import { fetchApplications, type ApplicationsQuery } from "../services";

const SEARCH_DEBOUNCE_MS = 150; // CA-04.2: la tabla debe actualizarse en menos de 300 ms
const LOAD_ERROR_MESSAGE = "No se pudieron cargar las solicitudes. Intenta nuevamente.";

type FilterPatch = Partial<Pick<ApplicationsQuery, "career" | "status">>;

export function useApplications() {
  const state = useApplicationStore();
  const { query } = state;
  const [searchInput, setSearchInput] = useState(query.search);
  const [reloadKey, setReloadKey] = useState(0);
  const requestId = useRef(0);

  // Búsqueda por texto con retardo corto, para no consultar en cada tecla
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = applicationStore.getState().query;
      const search = searchInput.trim();
      if (search !== current.search) {
        applicationStore.setState({ query: { ...current, search, page: 1 } });
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Carga los datos cada vez que cambia la consulta; ignora respuestas viejas
  useEffect(() => {
    const id = ++requestId.current;
    applicationStore.setState({ status: "loading", error: null });
    fetchApplications(query)
      .then((result) => {
        if (id !== requestId.current) return;
        applicationStore.setState({ status: "ready", items: result.items, total: result.total });
      })
      .catch(() => {
        if (id !== requestId.current) return;
        applicationStore.setState({ status: "error", error: LOAD_ERROR_MESSAGE });
      });
  }, [query, reloadKey]);

  const setFilter = useCallback((partial: FilterPatch) => {
    const current = applicationStore.getState().query;
    applicationStore.setState({ query: { ...current, ...partial, page: 1 } });
  }, []);

  const setPage = useCallback((page: number) => {
    const current = applicationStore.getState().query;
    applicationStore.setState({ query: { ...current, page } });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    applicationStore.setState({ query: initialQuery });
  }, []);

  // Vuelve a pedir la tabla (por ejemplo, después de emitir un dictamen)
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, searchInput, setSearchInput, setFilter, setPage, clearFilters, reload };
}