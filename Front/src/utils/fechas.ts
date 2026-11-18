// src/utils/fechas.ts
export const isoAMilisegundos = (iso: string): number =>
  new Date(iso.replace(/(\.\d{3})\d+/, "$1")).getTime();
