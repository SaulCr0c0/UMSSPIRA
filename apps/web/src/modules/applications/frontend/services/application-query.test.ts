/// <reference types="jest" />
import {
  DEFAULT_PAGE_SIZE,
  EMPTY_URL_STATE,
  changeFilters,
  changePage,
  changePageSize,
  clampPage,
  parseApplicationsUrl,
  toApplicationsParams,
  totalPagesFor,
} from "./application-query";

describe("parseApplicationsUrl", () => {
  it("sin parámetros devuelve los valores por defecto", () => {
    expect(parseApplicationsUrl(new URLSearchParams(""))).toEqual(EMPTY_URL_STATE);
  });

  it("lee página, tamaño, búsqueda, carrera y estado", () => {
    const state = parseApplicationsUrl(
      new URLSearchParams("page=3&size=25&q=ana&career=Sistemas&status=PENDING"),
    );

    expect(state).toEqual({ page: 3, pageSize: 25, search: "ana", career: "Sistemas", status: "PENDING" });
  });

  it("ignora un tamaño que no está entre 10, 15, 25 y 50", () => {
    expect(parseApplicationsUrl(new URLSearchParams("size=7")).pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(parseApplicationsUrl(new URLSearchParams("size=100")).pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it("ignora páginas inválidas y estados desconocidos", () => {
    const state = parseApplicationsUrl(new URLSearchParams("page=0&status=inventado"));

    expect(state.page).toBe(1);
    expect(state.status).toBe("");
  });
});

describe("toApplicationsParams", () => {
  it("no escribe los valores por defecto", () => {
    expect(toApplicationsParams(EMPTY_URL_STATE).toString()).toBe("");
  });

  it("escribe solo lo que cambió", () => {
    const params = toApplicationsParams({ ...EMPTY_URL_STATE, page: 2, pageSize: 50, search: "ana" });

    expect(params.get("page")).toBe("2");
    expect(params.get("size")).toBe("50");
    expect(params.get("q")).toBe("ana");
    expect(params.has("career")).toBe(false);
  });

  it("lo que se escribe se vuelve a leer igual", () => {
    const state = { page: 4, pageSize: 10, search: "paz", career: "Ingeniería de Sistemas", status: "APPROVED" as const };

    expect(parseApplicationsUrl(toApplicationsParams(state))).toEqual(state);
  });
});

describe("cambios de estado", () => {
  const state = { page: 3, pageSize: 15, search: "ana", career: "Sistemas", status: "PENDING" as const };

  it("al cambiar el tamaño vuelve a la página 1 y conserva los filtros (CA-08.2)", () => {
    expect(changePageSize(state, 25)).toEqual({ ...state, pageSize: 25, page: 1 });
  });

  it("al cambiar un filtro vuelve a la página 1 y conserva el resto (CA-08.3)", () => {
    expect(changeFilters(state, { status: "APPROVED" })).toEqual({ ...state, status: "APPROVED", page: 1 });
  });

  it("al cambiar de página conserva filtros, búsqueda y tamaño (CA-08.3)", () => {
    expect(changePage(state, 4)).toEqual({ ...state, page: 4 });
  });
});

describe("total de páginas", () => {
  it("calcula las páginas según el tamaño elegido", () => {
    expect(totalPagesFor(142, 10)).toBe(15);
    expect(totalPagesFor(142, 50)).toBe(3);
    expect(totalPagesFor(0, 15)).toBe(1);
  });

  it("usa la última página cuando el enlace trae una que no existe", () => {
    expect(clampPage({ ...EMPTY_URL_STATE, page: 99 }, 142).page).toBe(10);
    expect(clampPage({ ...EMPTY_URL_STATE, page: 2 }, 142).page).toBe(2);
  });
});