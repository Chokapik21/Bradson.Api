// src/api/incidencias.ts
import { http } from "./client";
import type { IncidenciaCreateDto, IncidenciaDto, IncidenciaEstadoDto } from "@/types";

export const incidenciasApi = {
  listar: (): Promise<IncidenciaDto[]> =>
    http.get<IncidenciaDto[]>("/incidencias").then((r) => r.data),

  obtener: (id: number): Promise<IncidenciaDto> =>
    http.get<IncidenciaDto>(`/incidencias/${id}`).then((r) => r.data),

  crear: (dto: IncidenciaCreateDto): Promise<IncidenciaDto> =>
    http.post<IncidenciaDto>("/incidencias", dto).then((r) => r.data),

  cambiarEstado: (id: number, dto: IncidenciaEstadoDto): Promise<void> =>
    http.patch(`/incidencias/${id}/estado`, dto).then(() => undefined),
};