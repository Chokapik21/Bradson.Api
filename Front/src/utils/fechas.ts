// src/utils/fechas.ts
import type { DiaSemana } from "@/types";

export const isoAMilisegundos = (iso: string): number =>
  new Date(iso.replace(/(\.\d{3})\d+/, "$1")).getTime();

const dos = (n: number): string => String(n).padStart(2, "0");

const DIAS: DiaSemana[] = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

export const diaSemanaDe = (d: Date): DiaSemana => DIAS[d.getDay()];

// Fecha de una y hora de otra: los selectores devuelven cada uno un Date completo.
export const combinarFechaHora = (fecha: Date, hora: Date): Date =>
  new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), hora.getHours(), hora.getMinutes(), 0, 0);

export const aFechaApi = (d: Date): string => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;

export const aHoraApi = (d: Date): string => `${dos(d.getHours())}:${dos(d.getMinutes())}:00`;

export const formatearFecha = (d: Date): string => `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()}`;

export const formatearHora = (d: Date): string => {
  const h24 = d.getHours();
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${dos(d.getMinutes())} ${h24 < 12 ? "a. m." : "p. m."}`;
};

export const formatearFechaApi = (iso: string): string => {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
};

export const diaUTCDeApi = (iso: string): number => {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return Date.UTC(anio ?? 1970, (mes ?? 1) - 1, dia ?? 1);
};

export const milisegundosReserva = (fecha: string, hora: string): number => {
  const [h24, minutos] = hora.split(":").map(Number);
  return diaUTCDeApi(fecha) + (h24 ?? 0) * 3_600_000 + (minutos ?? 0) * 60_000;
};

export const formatearHoraApi = (hora: string): string => {
  const [h24 = 0, minutos = 0] = hora.split(":").map(Number);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${dos(minutos)} ${h24 < 12 ? "a. m." : "p. m."}`;
};

export const etiquetaFechaApi = (iso: string): string => {
  const ahora = new Date();
  const hoy = Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const diferenciaDias = Math.round((diaUTCDeApi(iso) - hoy) / 86_400_000);

  if (diferenciaDias === 0) return "Hoy";
  if (diferenciaDias === 1) return "Mañana";
  if (diferenciaDias === -1) return "Ayer";
  return formatearFechaApi(iso);
};

export const formatearFechaHoraApi = (fecha: string, hora: string): string =>
  `${etiquetaFechaApi(fecha)}, ${formatearHoraApi(hora)}`;
