/**
 * Determina si un error corresponde a un estado HTTP 401 (no autenticado / sesión vencida).
 * El botón 'Reintentar' se oculta exclusivamente cuando esta condición es verdadera.
 */
export function isUnauthorizedStatus(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'status' in error && (error as { status?: unknown }).status === 401;
}
