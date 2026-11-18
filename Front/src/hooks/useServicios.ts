// src/hooks/useServicios.ts
import { useCallback, useEffect, useState } from "react";
import { ApiError, serviciosApi } from "@/api";
import { toast } from "@/components";
import type { ServicioDto } from "@/types";

export function useServicios() {
  const [servicios, setServicios] = useState<ServicioDto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Devuelve el mensaje de error, o null si salió bien.
  const cargar = useCallback(async (): Promise<string | null> => {
    try {
      setServicios(await serviciosApi.listar());
      setError(null);
      return null;
    } catch (e) {
      const mensaje = e instanceof ApiError ? e.message : "No se pudieron cargar los servicios.";
      setError(mensaje);
      return mensaje;
    }
  }, []);

  useEffect(() => {
    void cargar().finally(() => setCargando(false));
  }, [cargar]);

  const refrescar = useCallback(async (): Promise<void> => {
    setRefrescando(true);
    const mensaje = await cargar();
    setRefrescando(false);
    if (mensaje !== null) toast.error(mensaje);
  }, [cargar]);

  const reintentar = useCallback(async (): Promise<void> => {
    setCargando(true);
    await cargar();
    setCargando(false);
  }, [cargar]);

  return { servicios, cargando, refrescando, error, refrescar, reintentar };
}