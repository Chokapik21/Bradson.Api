// src/hooks/useReserva.ts
import { useCallback, useEffect, useState } from "react";
import { ApiError, reservasApi, pagosApi } from "@/api";
import type { ReservaDto, PagoDto } from "@/types";

export function useReserva(id: number | null) {
  const [reserva, setReserva] = useState<ReservaDto | null>(null);
  const [pago, setPago] = useState<PagoDto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (): Promise<void> => {
    if (id === null) {
      setError("Reserva no válida.");
      setCargando(false);
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const res = await reservasApi.obtener(id);
      setReserva(res);

      // Intentar cargar el pago si la reserva está finalizada
      if (res.estado === "Finalizado") {
        try {
          const p = await pagosApi.obtenerPorReserva(id);
          setPago(p);
        } catch {
          // El pago podría no existir aún o fallar, no bloqueamos la reserva
        }
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo cargar la reserva.");
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return { reserva, pago, cargando, error, reintentar: cargar, setReserva, setPago };
}
