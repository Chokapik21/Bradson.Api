import type { EstadoSolucion } from "./enums";

export interface IncidenciaDto {
  id: number;
  tipoNovedad: string;
  descripcion: string;
  estadoSolucion: EstadoSolucion;
  idReserva: number;
}

export interface IncidenciaCreateDto {
  tipoNovedad: string;
  descripcion: string;
  idReserva: number;
}

export interface IncidenciaEstadoDto {
  estadoSolucion: EstadoSolucion;
}