// src/utils/validaciones.ts
import { z } from "zod";

export const loginSchema = z.object({
  correo: z
    .string()
    .trim()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido")
    .max(150, "El correo no puede superar 150 caracteres"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registroSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150, "El nombre no puede superar 150 caracteres"),
  documento: z
    .string()
    .trim()
    .min(5, "El documento debe tener al menos 5 caracteres")
    .max(20, "El documento no puede superar 20 caracteres"),
  telefono: z
    .string()
    .trim()
    .regex(/^\+?\d{7,15}$/, "Ingresa un teléfono válido, solo números (7 a 15 dígitos)"),
  correo: z
    .string()
    .trim()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido")
    .max(150, "El correo no puede superar 150 caracteres"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  rol: z.enum(["Cliente", "Trabajador"], {
    error: "Selecciona si eres Cliente o Trabajador",
  }),
});

export type RegistroFormValues = z.infer<typeof registroSchema>;