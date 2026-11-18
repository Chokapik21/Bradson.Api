// src/components/Toast.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, type ComponentProps } from "react";
import { Animated, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { create } from "zustand";

export type TipoToast = "exito" | "error" | "info";

interface ToastState {
  mensaje: string | null;
  tipo: TipoToast;
  id: number;
  mostrar: (mensaje: string, tipo?: TipoToast) => void;
  ocultar: () => void;
}

let temporizador: ReturnType<typeof setTimeout> | undefined;

const useToastStore = create<ToastState>()((set) => ({
  mensaje: null,
  tipo: "info",
  id: 0,
  mostrar: (mensaje, tipo = "info") => {
    if (temporizador) clearTimeout(temporizador);
    set((s) => ({ mensaje, tipo, id: s.id + 1 }));
    temporizador = setTimeout(() => set({ mensaje: null }), 3500);
  },
  ocultar: () => {
    if (temporizador) clearTimeout(temporizador);
    set({ mensaje: null });
  },
}));

export const toast = {
  exito: (mensaje: string): void => useToastStore.getState().mostrar(mensaje, "exito"),
  error: (mensaje: string): void => useToastStore.getState().mostrar(mensaje, "error"),
  info: (mensaje: string): void => useToastStore.getState().mostrar(mensaje, "info"),
};

const estilos: Record<TipoToast, string> = {
  exito: "bg-brand-dark",
  error: "bg-red-600",
  info: "bg-gray-800",
};

const iconos: Record<TipoToast, ComponentProps<typeof Ionicons>["name"]> = {
  exito: "checkmark-circle",
  error: "alert-circle",
  info: "information-circle",
};

export function ToastHost() {
  const mensaje = useToastStore((s) => s.mensaje);
  const tipo = useToastStore((s) => s.tipo);
  const id = useToastStore((s) => s.id);
  const ocultar = useToastStore((s) => s.ocultar);
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (mensaje === null) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [id, mensaje, anim]);

  if (mensaje === null) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: insets.top + 8,
        left: 16,
        right: 16,
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
      }}
    >
      <Pressable onPress={ocultar} className={`flex-row items-center rounded-2xl px-4 py-3 ${estilos[tipo]}`}>
        <Ionicons name={iconos[tipo]} size={20} color="#FFFFFF" />
        <Text className="ml-2 flex-1 text-sm font-medium text-white">{mensaje}</Text>
      </Pressable>
    </Animated.View>
  );
}