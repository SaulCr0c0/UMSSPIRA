import { useState, useMemo } from "react";
import { Applicant } from "../types/applicant";

export function useApplicantFilters(initialApplicants: Applicant[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minMatch, setMinMatch] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("Todos");
  const [selectedLevel, setSelectedLevel] = useState<string>("Todos");

  const filteredApplicants = useMemo(() => {
    return initialApplicants.filter((applicant) => {
      // CA-02, CA-13, CA-16: % Mínimo de Coincidencia Técnica
      if (applicant.matchPercentage < minMatch) return false;

      // CA-06, CA-11: Buscador por Texto (Nombre o Correo)
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const matchesName = applicant.name.toLowerCase().includes(query);
        const matchesEmail = applicant.email.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) return false;
      }

      // CA-04, CA-18: Estado del Postulante
      if (selectedStatus !== "Todos" && applicant.status !== selectedStatus) {
        return false;
      }

      // CA-05, CA-18: Nivel de Experiencia
      if (selectedLevel !== "Todos" && applicant.experienceLevel !== selectedLevel) {
        return false;
      }

      return true;
    });
  }, [initialApplicants, searchTerm, minMatch, selectedStatus, selectedLevel]);

  // CA-08, CA-14, CA-19: Restablecimiento de Filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setMinMatch(0);
    setSelectedStatus("Todos");
    setSelectedLevel("Todos");
  };

  return {
    searchTerm,
    setSearchTerm,
    minMatch,
    setMinMatch,
    selectedStatus,
    setSelectedStatus,
    selectedLevel,
    setSelectedLevel,
    filteredApplicants,
    handleClearFilters,
  };
}