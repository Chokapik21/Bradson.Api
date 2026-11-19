// Convierte la ruta de foto guardada por el backend (/uploads/...) en una URL absoluta.
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/api\/?$/, "");

export function urlArchivo(ruta?: string | null): string | null {
  if (!ruta) return null;
  if (/^https?:\/\//i.test(ruta)) return ruta;
  const limpia = ruta.startsWith("/") ? ruta : `/${ruta}`;
  return `${API_URL}${limpia}`;
}
