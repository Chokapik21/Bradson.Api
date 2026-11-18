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
