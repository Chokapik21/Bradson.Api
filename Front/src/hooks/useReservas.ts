// src/hooks/useReservas.ts
import { ApiError, reservasApi } from "@/api";
import type { ReservaDto } from "@/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

export function useReservas() {
  const [reservas, setReservas] = useState<ReservaDto[]>([]);
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
      const data = await reservasApi.listar();
      setReservas(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudieron cargar tus reservas.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const primera = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primera.current) {
        primera.current = false; // la primera carga ya la hace el useEffect
        return;
      }
      void cargar(true);
    }, [cargar]),
  );

  return {
    reservas,
    cargando,
    refrescando,
    error,
    refrescar: () => cargar(true),
    reintentar: () => cargar(),
  };
}