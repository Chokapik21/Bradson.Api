// src/api/servicios.ts
import { http } from "./client";
import type { ServicioDto, ServicioUpsertDto } from "@/types";

export const serviciosApi = {
  listar: (): Promise<ServicioDto[]> =>
    http.get<ServicioDto[]>("/servicios").then((r) => r.data),

  obtener: (id: number): Promise<ServicioDto> =>
    http.get<ServicioDto>(`/servicios/${id}`).then((r) => r.data),

  crear: (dto: ServicioUpsertDto): Promise<ServicioDto> =>
    http.post<ServicioDto>("/servicios", dto).then((r) => r.data),

  actualizar: (id: number, dto: ServicioUpsertDto): Promise<void> =>
    http.put(`/servicios/${id}`, dto).then(() => undefined),

  eliminar: (id: number): Promise<void> =>
    http.delete(`/servicios/${id}`).then(() => undefined),
};