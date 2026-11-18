// src/hooks/useServicio.ts
import { ApiError, serviciosApi } from "@/api";
import type { ServicioDto } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useServicio(id: number | null) {
  const [servicio, setServicio] = useState<ServicioDto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (): Promise<void> => {
    if (id === null) {
      setError("Servicio no válido.");
      setCargando(false);
      return;
    }
    setCargando(true);
    setError(null);
    try {
      setServicio(await serviciosApi.obtener(id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo cargar el servicio.");
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return { servicio, cargando, error, reintentar: cargar };
}