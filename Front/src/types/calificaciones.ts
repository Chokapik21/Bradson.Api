export interface CalificacionDto {
  id: number;
  puntuacion: number;
  comentario: string | null;
  fechaRegistro: string;
  idReserva: number;
}

export interface CalificacionUpsertDto {
  puntuacion: number;     // 1 a 5
  comentario?: string | null;
  idReserva: number;
}