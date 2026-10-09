/// <reference types="jest" />
import {
  fetchApplications,
  getMarkerLabel,
  getSla,
  isOverdue,
  type Application,
  type ApplicationsQuery,
} from "./application.service";

const HOUR = 3_600_000;
const NOW = Date.now();

function makeApplication(status: Application["status"], hoursAgo: number): Application {
  return {
    id: "prueba",
    code: "EGR-2025-000001",
    fullName: "Ana Prueba",
    email: "ana@example.com",
    ci: "1234567",
    issuedIn: "CB",
    sisCode: "201600001",
    career: "Ingeniería de Sistemas",
    documentType: "diploma",
    status,
    submittedAt: new Date(NOW - hoursAgo * HOUR).toISOString(),
  };
}

const baseQuery: ApplicationsQuery = {
  page: 1,
  pageSize: 15,
  career: "",
  status: "",
  search: "",
};

describe("isOverdue (alerta de 48 horas, CA-04.1)", () => {
  it("marca una solicitud pendiente de más de 48 horas", () => {
    expect(isOverdue(makeApplication("PENDING", 60), NOW)).toBe(true);
  });

  it("no marca una pendiente dentro del plazo", () => {
    expect(isOverdue(makeApplication("PENDING", 10), NOW)).toBe(false);
  });

  it("no marca las solicitudes que ya tienen dictamen", () => {
    expect(isOverdue(makeApplication("APPROVED", 100), NOW)).toBe(false);
    expect(isOverdue(makeApplication("REJECTED", 100), NOW)).toBe(false);
  });
});

describe("getSla y getMarkerLabel", () => {
  it("una pendiente vencida lleva prioridad alta", () => {
    const application = makeApplication("PENDING", 60);
    expect(getSla(application, NOW).tone).toBe("overdue");
    expect(getMarkerLabel(application, NOW)).toBe("PRIORIDAD ALTA");
  });

  it("una pendiente reciente va a tiempo", () => {
    expect(getSla(makeApplication("PENDING", 5), NOW).tone).toBe("ok");
  });

  it("una observada queda pausada", () => {
    expect(getSla(makeApplication("OBSERVED", 20), NOW).label).toContain("Pausado");
  });

  it("una aprobada queda finalizada", () => {
    expect(getSla(makeApplication("APPROVED", 20), NOW).tone).toBe("closed");
  });
});

describe("fetchApplications", () => {
  // Se reemplaza por pruebas de la llamada real cuando exista GET /api/applications
  it("devuelve una lista vacía mientras no exista la API, sin datos inventados", async () => {
    const result = await fetchApplications(baseQuery);

    expect(result).toEqual({ items: [], total: 0 });
  });
});