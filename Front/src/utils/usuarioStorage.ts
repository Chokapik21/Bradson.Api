// src/utils/usuarioStorage.ts
import * as SecureStore from "expo-secure-store";
import { z } from "zod";

const KEY = "bradson_sesion";

const sesionSchema = z.object({
  usuario: z.object({
    id: z.number(),
    nombre: z.string(),
    documento: z.string(),
    correo: z.string(),
    telefono: z.string(),
    estadoCuenta: z.string(),
    verificado: z.boolean(),
    rol: z.enum(["Cliente", "Trabajador", "Administrador"]),
  }),
  expiracionUtc: z.string(),
});

export type SesionGuardada = z.infer<typeof sesionSchema>;

export const usuarioStorage = {
  get: async (): Promise<SesionGuardada | null> => {
    const raw = await SecureStore.getItemAsync(KEY);
    if (raw === null) return null;
    try {
      const resultado = sesionSchema.safeParse(JSON.parse(raw));
      return resultado.success ? resultado.data : null;
    } catch {
      return null;
    }
  },
  set: (sesion: SesionGuardada): Promise<void> =>
    SecureStore.setItemAsync(KEY, JSON.stringify(sesion)),
  clear: (): Promise<void> => SecureStore.deleteItemAsync(KEY),
};