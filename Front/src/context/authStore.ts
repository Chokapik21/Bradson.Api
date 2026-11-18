// src/context/authStore.ts
import { create } from "zustand";
import { authApi, setUnauthorizedHandler } from "@/api";
import type { AuthResponseDto, LoginDto, UsuarioDto, UsuarioRegistroDto } from "@/types";
import { isoAMilisegundos } from "@/utils/fechas";
import { tokenStorage } from "@/utils/tokenStorage";
import { usuarioStorage } from "@/utils/usuarioStorage";

export type EstadoSesion = "cargando" | "autenticado" | "anonimo";

interface AuthState {
  estado: EstadoSesion;
  usuario: UsuarioDto | null;
  restaurarSesion: () => Promise<void>;
  iniciarSesion: (dto: LoginDto) => Promise<void>;
  registrar: (dto: UsuarioRegistroDto) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const guardarSesion = async (auth: AuthResponseDto): Promise<void> => {
  // El token va primero: el interceptor de Axios lo lee de ahí en la siguiente petición.
  await tokenStorage.set(auth.token);
  await usuarioStorage.set({ usuario: auth.usuario, expiracionUtc: auth.expiracionUtc });
};

const limpiarSesion = async (): Promise<void> => {
  await Promise.all([tokenStorage.clear(), usuarioStorage.clear()]);
};

export const useAuthStore = create<AuthState>()((set) => ({
  estado: "cargando",
  usuario: null,

  restaurarSesion: async () => {
    try {
      const [token, guardada] = await Promise.all([tokenStorage.get(), usuarioStorage.get()]);
      if (token && guardada && isoAMilisegundos(guardada.expiracionUtc) > Date.now()) {
        set({ usuario: guardada.usuario, estado: "autenticado" });
        return;
      }
      await limpiarSesion();
    } catch {
      // Si el almacenamiento falla, es más seguro arrancar sin sesión que romper la app.
    }
    set({ usuario: null, estado: "anonimo" });
  },

  // Los errores (ApiError) se dejan subir a propósito: la pantalla decide cómo mostrarlos.
  iniciarSesion: async (dto) => {
    const auth = await authApi.login(dto);
    await guardarSesion(auth);
    set({ usuario: auth.usuario, estado: "autenticado" });
  },

  registrar: async (dto) => {
    const auth = await authApi.registrar(dto);
    await guardarSesion(auth);
    set({ usuario: auth.usuario, estado: "autenticado" });
  },

  cerrarSesion: async () => {
    await limpiarSesion();
    set({ usuario: null, estado: "anonimo" });
  },
}));

// Conecta el interceptor de Axios con el store: un 401 fuera del login cierra la sesión.
// Va aquí, y no en api/client.ts, para evitar un import circular.
setUnauthorizedHandler(() => {
  void useAuthStore.getState().cerrarSesion();
});