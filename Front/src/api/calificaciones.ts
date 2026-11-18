// src/api/calificaciones.ts
import { http } from "./client";
import type { CalificacionDto, CalificacionUpsertDto } from "@/types";

export const calificacionesApi = {
  listar: (): Promise<CalificacionDto[]> =>
    http.get<CalificacionDto[]>("/calificaciones").then((r) => r.data),

  obtener: (id: number): Promise<CalificacionDto> =>
    http.get<CalificacionDto>(`/calificaciones/${id}`).then((r) => r.data),

  crear: (dto: CalificacionUpsertDto): Promise<CalificacionDto> =>
    http.post<CalificacionDto>("/calificaciones", dto).then((r) => r.data),

  eliminar: (id: number): Promise<void> =>
    http.delete(`/calificaciones/${id}`).then(() => undefined),
};