// src/utils/validaciones.ts
import { z } from "zod";
import { combinarFechaHora } from "./fechas";

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

export const ANTICIPACION_MIN_MINUTOS = 60;

export const reservaSchema = z
  .object({
    fecha: z.date({ error: "Selecciona la fecha" }),
    hora: z.date({ error: "Selecciona la hora" }),
    direccion: z
      .string()
      .trim()
      .min(5, "Escribe la dirección completa")
      .max(255, "La dirección no puede superar 255 caracteres"),
    referencia: z.string().trim().max(255, "Máximo 255 caracteres"),
    ubicacion: z.object(
      { latitude: z.number(), longitude: z.number() },
      { error: "Marca la ubicación en el mapa" },
    ),
  })
  .refine(
    (v) => combinarFechaHora(v.fecha, v.hora).getTime() >= Date.now() + ANTICIPACION_MIN_MINUTOS * 60_000,
    {
      message: `Debe ser con al menos ${ANTICIPACION_MIN_MINUTOS} minutos de anticipación`,
      path: ["hora"],
    },
  );

export type ReservaFormValues = z.infer<typeof reservaSchema>;

export const pagoSchema = z.object({
  metodoPago: z.enum(["Tarjeta", "PSE", "Efectivo", "Otro"], { error: "Selecciona un método de pago" }),
});

export type PagoFormValues = z.infer<typeof pagoSchema>;

export const calificacionSchema = z.object({
  puntuacion: z.number().min(1, "Selecciona al menos 1 estrella").max(5, "Máximo 5 estrellas"),
  comentario: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
});

export type CalificacionFormValues = z.infer<typeof calificacionSchema>;
