export async function saveSession(token: string, role: string, remember: boolean): Promise<void> {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, role, remember }),
  });
  if (!response.ok) {
    throw new Error("No se pudo iniciar la sesión de forma segura.");
  }
}

export async function clearSession(): Promise<void> {
  const response = await fetch("/api/auth/session", { method: "DELETE" });
  if (!response.ok) {
    throw new Error("No se pudo cerrar la sesión de forma segura.");
  }
}