import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { ApplicationStatus, ReviewResponse } from "@umsspira/shared-types"; // TODO: ajustar el nombre real del paquete
export type ApplicantContact = { email: string; fullName: string };
type SaveReviewInput = Omit<ReviewResponse, "id" | "reviewedAt">;

@Injectable()
export class ReviewsRepository {
  // TODO(BD): reemplazar por Prisma/TypeORM cuando Jhoan tenga el esquema
  private readonly statuses = new Map<string, ApplicationStatus>();
  private readonly reviews: ReviewResponse[] = [];

  async getApplicationStatus(
    applicationId: string,
  ): Promise<ApplicationStatus | null> {
    // Mock: cualquier id es una solicitud PENDING hasta que se dictamina
    return this.statuses.get(applicationId) ?? "PENDING";
  }

  async saveReview(input: SaveReviewInput): Promise<ReviewResponse> {
    const review: ReviewResponse = {
      id: randomUUID(),
      reviewedAt: new Date().toISOString(),
      ...input,
    };
    // TODO(BD): en una sola transacción, insertar el dictamen
    // y actualizar el estado de la solicitud
    this.reviews.push(review);
    this.statuses.set(input.applicationId, input.status);
    return review;
  }

  async getApplicantContact(_applicationId: string): Promise<ApplicantContact | null> {
    // TODO(BD): leer el correo y el nombre del egresado desde la solicitud
    // (los datos que ingresó en el registro). Mock mientras no exista el esquema.
    return { email: 'titulado.prueba@example.com', fullName: 'Titulado de Prueba' };
  }
}