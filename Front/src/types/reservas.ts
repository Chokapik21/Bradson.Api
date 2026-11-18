import type { EstadoReserva } from "./enums";

export interface ReservaDto {
  id: number;
  fecha: string;          // "yyyy-MM-dd"
  hora: string;           // "HH:mm:ss"
  estado: EstadoReserva;
  precioTotal: number;
  direccion: string;
  referencia: string | null;
  idCliente: number;
  idTrabajador: number;
  idServicio: number;
  nombreServicio?: string;
  nombreCliente?: string | null;
  nombreTrabajador?: string | null;
  telefonoTrabajador?: string | null;
}

//idCliente no va, el backend lo toma del token.
export interface ReservaCreateDto {
  fecha: string;
  hora: string;
  latitud: number;
  longitud: number;
  direccion: string;
  referencia?: string | null;
  idTrabajador: number;
  idServicio: number;
}

export interface ReservaEstadoDto {
  estado: EstadoReserva;
}

export interface TrabajadorDisponibleDto {
  idTrabajador: number;
  nombre: string;
  distanciaKm: number;
}