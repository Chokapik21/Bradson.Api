import type { EstadoPago, MetodoPago } from "./enums";

export interface PagoDto {
  id: number;
  montoBruto: number;
  comisionApp: number;
  montoNeto: number;
  metodoPago: MetodoPago;
  estadoPago: EstadoPago;
  fechaPago: string | null;
  idReserva: number;
}

export interface PagoProcesarDto {
  metodoPago: MetodoPago;
}

export interface DetallePagoDto {
  id: number;
  pasarela: string;
  referenciaTransaccion: string;
  tokenTransaccion: string | null;
  codigoRespuesta: string | null;
  fechaRespuesta: string;
  idPago: number;
}