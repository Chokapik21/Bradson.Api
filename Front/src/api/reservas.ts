// src/api/reservas.ts
import { http } from "./client";
import type {
  DiaSemana,
  ReservaCreateDto,
  ReservaDto,
  ReservaEstadoDto,
  TrabajadorDisponibleDto,
} from "@/types";

export interface BuscarTrabajadoresParams {
  lat: number;
  lon: number;
  diaSemana: DiaSemana;
  hora: string; // "HH:mm:ss"
}

export const reservasApi = {
  listar: (): Promise<ReservaDto[]> =>
    http.get<ReservaDto[]>("/reservas").then((r) => r.data),

  obtener: (id: number): Promise<ReservaDto> =>
    http.get<ReservaDto>(`/reservas/${id}`).then((r) => r.data),

  // Solo rol Cliente. Filtra a 10 km y por disponibilidad.
  buscarTrabajadoresDisponibles: (params: BuscarTrabajadoresParams): Promise<TrabajadorDisponibleDto[]> =>
    http
      .get<TrabajadorDisponibleDto[]>("/reservas/trabajadores-disponibles", { params })
      .then((r) => r.data),

  crear: (dto: ReservaCreateDto): Promise<ReservaDto> =>
    http.post<ReservaDto>("/reservas", dto).then((r) => r.data),

  // Responde 204: no hay cuerpo que devolver.
  cambiarEstado: (id: number, dto: ReservaEstadoDto): Promise<void> =>
    http.patch(`/reservas/${id}/estado`, dto).then(() => undefined),
};