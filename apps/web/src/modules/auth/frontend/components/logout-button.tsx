"use client";

import { useRouter } from "next/navigation";
import { authStore } from "../store";
import { clearSession } from "../services";

export function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    clearSession();
    authStore.reset();
    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm font-medium text-white/90 hover:text-white"
    >
      Cerrar sesión
    </button>
  );
}