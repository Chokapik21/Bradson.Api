export interface ServicioDto {
  id: number;
  nombreCategoria: string;
  descripcion: string;
  tarifaBase: number;
}

export interface ServicioUpsertDto {
  nombreCategoria: string;
  descripcion: string;
  tarifaBase: number;
}