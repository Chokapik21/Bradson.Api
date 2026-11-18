// src/api/pagos.ts
import { http } from "./client";
import type { PagoDto, PagoProcesarDto } from "@/types";

export const pagosApi = {
  listar: (): Promise<PagoDto[]> =>
    http.get<PagoDto[]>("/pagos").then((r) => r.data),

  obtener: (id: number): Promise<PagoDto> =>
    http.get<PagoDto>(`/pagos/${id}`).then((r) => r.data),

  // 404 si la reserva aún no está Finalizada: el Pago se crea en ese momento.
  obtenerPorReserva: (idReserva: number): Promise<PagoDto> =>
    http.get<PagoDto>(`/pagos/reserva/${idReserva}`).then((r) => r.data),

  // forzarExito sirve para probar el camino de pago fallido sin depender del azar.
  procesar: (id: number, dto: PagoProcesarDto, forzarExito?: boolean): Promise<PagoDto> =>
    http
      .patch<PagoDto>(`/pagos/${id}/procesar`, dto, { params: { forzarExito } })
      .then((r) => r.data),
};