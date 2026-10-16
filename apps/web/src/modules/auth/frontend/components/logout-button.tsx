"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authStore } from "../store";
import { clearAccessToken } from "@/shared/services/auth-session";
import { clearSession } from "../services";

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
    router.push("/login");
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