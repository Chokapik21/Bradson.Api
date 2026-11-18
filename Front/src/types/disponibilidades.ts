import type { DiaSemana } from "./enums";

export interface DisponibilidadDto {
  id: number;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  idTrabajador: number;
}

export interface DisponibilidadUpsertDto {
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  idTrabajador: number;
}