// src/api/client.ts
import { tokenStorage } from "@/utils/tokenStorage";
import axios from "axios";

export class ApiError extends Error {
  readonly status: number | null;
  readonly details: string[];

  constructor(message: string, status: number | null, details: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// El store de sesión registra aquí qué hacer cuando el token deja de servir (evita import circular).
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: () => void): void => {
  onUnauthorized = handler;
};

const defaultMessages: Record<number, string> = {
  400: "Los datos enviados no son válidos.",
  401: "Tu sesión expiró. Inicia sesión de nuevo.",
  403: "No tienes permiso para realizar esta acción.",
  404: "No se encontró lo que buscabas.",
  409: "Esta acción entra en conflicto con el estado actual.",
  500: "Error en el servidor. Intenta más tarde.",
};

// El backend responde string plano (BadRequest("..."), Conflict("...")) o ProblemDetails con "errors".
function extractMessage(data: unknown): { message: string; details: string[] } | null {
  if (typeof data === "string" && data.length > 0) {
    return { message: data, details: [] };
  }
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    if (typeof obj.errors === "object" && obj.errors !== null) {
      const details = Object.values(obj.errors as Record<string, unknown>).flatMap((v) =>
        Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [],
      );
      if (details.length > 0) return { message: details[0], details };
    }
    if (typeof obj.title === "string") return { message: obj.title, details: [] };
  }
  return null;
}

export const http = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(new ApiError("Ocurrió un error inesperado.", null));
    }
    if (!error.response) {
      return Promise.reject(
        new ApiError("No se pudo conectar con el servidor. Revisa tu conexión.", null),
      );
    }

    const status = error.response.status;
    const parsed = extractMessage(error.response.data);
    const message = parsed?.message ?? defaultMessages[status] ?? "Error al procesar la solicitud.";

    // Un 401 en el login significa "credenciales malas", no "sesión vencida".
    const esLogin = error.config?.url?.toLowerCase().includes("/auth/login") ?? false;
    if (status === 401 && !esLogin && onUnauthorized) onUnauthorized();

    return Promise.reject(new ApiError(message, status, parsed?.details ?? []));
  },
);