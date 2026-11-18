// src/hooks/useServicios.ts
import { ApiError, serviciosApi } from "@/api";
import type { ServicioDto } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useServicios() {
  const [servicios, setServicios] = useState<ServicioDto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (esRefresco = false): Promise<void> => {
    if (esRefresco) {
      setRefrescando(true);
    } else {
      setCargando(true);
    }

    setError(null);

    try {
      const datos = await serviciosApi.listar();
      setServicios(datos);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "No se pudieron cargar los servicios."
      );
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const refrescar = useCallback(async (): Promise<void> => {
    await cargar(true);
  }, [cargar]);

  const reintentar = useCallback(async (): Promise<void> => {
    await cargar();
  }, [cargar]);

  return {
    servicios,
    cargando,
    refrescando,
    error,
    refrescar,
    reintentar,
  };
}
