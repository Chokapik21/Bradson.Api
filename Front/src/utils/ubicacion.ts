// src/utils/ubicacion.ts
import * as Location from "expo-location";
import type { LatLng } from "react-native-maps";

export const MEDELLIN: LatLng = { latitude: 6.2442, longitude: -75.5812 };

// La columna del backend es decimal(9,6): seis decimales.
export const redondearCoordenada = (n: number): number => Math.round(n * 1_000_000) / 1_000_000;

export async function obtenerUbicacionActual(): Promise<LatLng | null> {
  try {
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (!permiso.granted) return null;
    const posicion = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: posicion.coords.latitude, longitude: posicion.coords.longitude };
  } catch {
    return null;
  }
}

// Sugiere una dirección a partir del pin. Si el servicio de geocodificación falla, devuelve null.
export async function direccionDesde(coord: LatLng): Promise<string | null> {
  try {
    const [r] = await Location.reverseGeocodeAsync(coord);
    if (r === undefined) return null;
    const partes = [r.street ?? r.name, r.streetNumber, r.district].filter(
      (p): p is string => typeof p === "string" && p !== "",
    );
    return partes.length > 0 ? partes.join(", ") : null;
  } catch {
    return null;
  }
}

// Convierte una dirección escrita en coordenadas. Si la geocodificación falla, devuelve null.
export async function coordenadaDesde(direccion: string): Promise<LatLng | null> {
  let t = direccion.trim();
  if (t.length < 5) return null;

  const municipios = [
    "medellín",
    "itagüí",
    "envigado",
    "bello",
    "sabaneta",
    "la estrella",
    "caldas",
    "copacabana",
    "girardota",
    "barbosa",
  ];
  const tLower = t.toLowerCase();
  const tieneMunicipio = municipios.some((m) => tLower.includes(m));
  const tienePais = tLower.includes("antioquia") || tLower.includes("colombia");

  if (!tieneMunicipio && !tienePais) {
    t += ", Medellín, Antioquia, Colombia";
  }

  try {
    const resultados = await Location.geocodeAsync(t);
    const primer = resultados[0];
    if (primer === undefined) return null;

    // Validación de Bounding Box Valle de Aburrá (ampliado a -75.3 para incluir Barbosa)
    const { latitude, longitude } = primer;
    if (latitude < 6.05 || latitude > 6.45 || longitude < -75.7 || longitude > -75.3) {
      return null;
    }

    return {
      latitude: redondearCoordenada(latitude),
      longitude: redondearCoordenada(longitude),
    };
  } catch {
    return null;
  }
}