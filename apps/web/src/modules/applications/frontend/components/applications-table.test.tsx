/// <reference types="jest" />
import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ApplicationsTable } from "./applications-table";
import type { Application } from "../services";

const HOUR = 3_600_000;

function makeApplication(status: Application["status"], hoursAgo: number): Application {
  return {
    id: "prueba",
    code: "EGR-2025-000001",
    fullName: "Ana Prueba",
    email: "ana.prueba@gmail.com",
    ci: "1234567",
    issuedIn: "CB",
    sisCode: "201600001",
    career: "Ingeniería de Sistemas",
    status,
    submittedAt: new Date(Date.now() - hoursAgo * HOUR).toISOString(),
  };
}

function renderTable(overrides: Partial<ComponentProps<typeof ApplicationsTable>> = {}) {
  const props = {
    items: [makeApplication("pendiente", 60)],
    total: 1,
    page: 1,
    status: "ready" as const,
    error: null,
    onPageChange: jest.fn(),
    onClearFilters: jest.fn(),
    ...overrides,
  };
  render(<ApplicationsTable {...props} />);
  return props;
}

describe("ApplicationsTable", () => {
  it("muestra la alerta en una solicitud pendiente de más de 48 horas (CA-04.1)", () => {
    renderTable();

    expect(screen.getByText("Alerta >48h")).toBeTruthy();
    expect(screen.getByText("Pendiente de validación")).toBeTruthy();
  });

  it("no muestra la alerta cuando la solicitud ya tiene dictamen", () => {
    renderTable({ items: [makeApplication("aprobado", 100)] });

    expect(screen.queryByText("Alerta >48h")).toBeNull();
    expect(screen.getByText("Aprobado")).toBeTruthy();
  });

  it("muestra el aviso y limpia los filtros cuando no hay resultados (CA-04.2)", () => {
    const props = renderTable({ items: [], total: 0 });

    expect(screen.getByText("No hay solicitudes que coincidan con tu búsqueda.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));

    expect(props.onClearFilters).toHaveBeenCalled();
  });

  it("avisa cuando se selecciona una fila (CA-04.3)", () => {
    const onSelect = jest.fn();
    renderTable({ onSelect });

    fireEvent.click(screen.getByText("Ana Prueba"));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ code: "EGR-2025-000001" }));
  });

  it("cambia de página con los botones", () => {
    const props = renderTable({ total: 40 });

    expect(screen.getByText("Mostrando 1-15 de 40 solicitudes")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Anterior" }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

    expect(props.onPageChange).toHaveBeenCalledWith(2);
  });
});