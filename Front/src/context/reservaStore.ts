// src/context/reservaStore.ts
import type { MetodoPago, ServicioDto, TrabajadorDisponibleDto } from "@/types";
import { create } from "zustand";

export interface BorradorReserva {
  servicio: ServicioDto;
  fecha: string; // "yyyy-MM-dd"
  hora: string; // "HH:mm:ss"
  direccion: string;
  referencia: string | null;
  latitud: number;
  longitud: number;
  trabajador: TrabajadorDisponibleDto;
  metodoPago?: "Tarjeta" | "PSE" | "Efectivo" | "Otro";
}

interface ReservaState {
  borrador: BorradorReserva | null;
  // Método elegido al reservar, por id de reserva (el backend todavía no lo guarda).
  metodosPago: Record<number, MetodoPago>;
  setBorrador: (borrador: BorradorReserva) => void;
  guardarMetodoPago: (idReserva: number, metodo: MetodoPago) => void;
  limpiar: () => void;
  reiniciar: () => void;
}

export const useReservaStore = create<ReservaState>()((set) => ({
  borrador: null,
  metodosPago: {},
  setBorrador: (borrador) => set({ borrador }),
  guardarMetodoPago: (idReserva, metodo) =>
    set((s) => ({ metodosPago: { ...s.metodosPago, [idReserva]: metodo } })),
  limpiar: () => set({ borrador: null }),
  reiniciar: () => set({ borrador: null, metodosPago: {} }),
}));