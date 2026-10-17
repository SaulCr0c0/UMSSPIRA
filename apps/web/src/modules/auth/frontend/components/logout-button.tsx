"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authStore } from "../store";
import { clearSession } from "../services";
import { hardRedirect } from "../services/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleLogout() {
    try {
      await clearSession();
    } catch {
      setError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
      return;
    }

    clearAccessToken();
    authStore.reset();
    // Con "Atrás" ya no se puede volver a ver la pantalla privada (CA-05.6)
    hardRedirect("/login");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { void handleLogout(); }}
        className="text-sm font-medium text-white/90 hover:text-white"
      >
        Cerrar sesión
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
