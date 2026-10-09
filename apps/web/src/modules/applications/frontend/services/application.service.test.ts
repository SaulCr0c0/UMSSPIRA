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
  age: "",
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
  it("respeta el tamaño de página y cuenta el total", async () => {
    const result = await fetchApplications(baseQuery);

    expect(result.items.length).toBe(15);
    expect(result.total).toBe(142);
  });

  it("muestra primero las pendientes, de la más antigua a la más reciente", async () => {
    const { items } = await fetchApplications(baseQuery);

    expect(items.every((item) => item.status === "PENDING")).toBe(true);
    const dates = items.map((item) => new Date(item.submittedAt).getTime());
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
  });

  it("filtra por estado", async () => {
    const { items, total } = await fetchApplications({ ...baseQuery, status: "APPROVED" });

    expect(total).toBeGreaterThan(0);
    expect(items.every((item) => item.status === "APPROVED")).toBe(true);
  });

  it("el filtro de más de 48 horas solo devuelve solicitudes vencidas", async () => {
    const { items, total } = await fetchApplications({ ...baseQuery, age: "over48" });

    expect(total).toBeGreaterThan(0);
    expect(items.every((item) => isOverdue(item))).toBe(true);
  });

  it("busca por código de expediente", async () => {
    const { items, total } = await fetchApplications({ ...baseQuery, search: "EGR-2025-004812" });

    expect(total).toBe(1);
    expect(items[0].code).toBe("EGR-2025-004812");
  });

  it("devuelve una lista vacía cuando nada coincide (CA-04.2)", async () => {
    const { items, total } = await fetchApplications({ ...baseQuery, search: "zzzz" });

    expect(total).toBe(0);
    expect(items).toEqual([]);
  });

  it("la segunda página trae otras solicitudes", async () => {
    const first = await fetchApplications(baseQuery);
    const second = await fetchApplications({ ...baseQuery, page: 2 });

    expect(second.items[0].id).not.toBe(first.items[0].id);
  });
});