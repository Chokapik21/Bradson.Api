// src/utils/categorias.ts
import type { ServicioDto } from "@/types";

export const FILTROS = ["Todos", "Limpieza", "Decoración"] as const;
export type FiltroCategoria = (typeof FILTROS)[number];
export type Categoria = Exclude<FiltroCategoria, "Todos">;

// Minúsculas y sin tildes, para que "decoracion" encuentre "Decoración".
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// El backend todavía no tiene un campo de categoría: se deduce del nombre del servicio.
// Cuando exista, solo hay que cambiar esta función.
export function categoriaDe(servicio: ServicioDto): Categoria {
  const nombre = normalizar(servicio.nombreCategoria);
  return /decorac|disen|interior|ambient/.test(nombre) ? "Decoración" : "Limpieza";
}