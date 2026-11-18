// src/api/detallesPago.ts
import { http } from "./client";
import type { DetallePagoDto } from "@/types";

export const detallesPagoApi = {
  listar: (): Promise<DetallePagoDto[]> =>
    http.get<DetallePagoDto[]>("/detallespago").then((r) => r.data),

  obtener: (id: number): Promise<DetallePagoDto> =>
    http.get<DetallePagoDto>(`/detallespago/${id}`).then((r) => r.data),

  obtenerPorPago: (idPago: number): Promise<DetallePagoDto> =>
    http.get<DetallePagoDto>(`/detallespago/pago/${idPago}`).then((r) => r.data),
};