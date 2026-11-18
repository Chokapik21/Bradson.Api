// src/utils/moneda.ts

/**
 * Formatea un valor numérico a formato de pesos colombianos (COP).
 * Ejemplo: 80000 -> "$80.000"
 */
export function formatMoneda(monto: number): string {
    if (isNaN(monto) || monto === null || monto === undefined) return "$0";
    return `$${Math.round(monto).toLocaleString("es-CO")}`;
}