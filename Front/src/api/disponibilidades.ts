// src/api/disponibilidades.ts
import { http } from "./client";
import type { DisponibilidadDto, DisponibilidadUpsertDto } from "@/types";

export const disponibilidadesApi = {
  // Solo Trabajador o Administrador.
  listar: (): Promise<DisponibilidadDto[]> =>
    http.get<DisponibilidadDto[]>("/disponibilidades").then((r) => r.data),

  crear: (dto: DisponibilidadUpsertDto): Promise<DisponibilidadDto> =>
    http.post<DisponibilidadDto>("/disponibilidades", dto).then((r) => r.data),

  eliminar: (id: number): Promise<void> =>
    http.delete(`/disponibilidades/${id}`).then(() => undefined),
};