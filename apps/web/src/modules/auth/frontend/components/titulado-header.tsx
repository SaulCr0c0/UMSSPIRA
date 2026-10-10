import { LogoutButton } from "./logout-button";

// Encabezado del área personal: sin ningún menú administrativo (CA-05.3 y CA-05.5)
export function TituladoHeader() {
  return (
    <header className="w-full bg-abyssal-blue">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
        <span className="font-display text-lg font-bold text-white">UMSSPIRA</span>
        <LogoutButton />
      </div>
    </header>
  );
}