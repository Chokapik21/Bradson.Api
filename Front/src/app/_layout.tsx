// src/app/_layout.tsx
import { ToastHost } from "@/components";
import { useAuthStore } from "@/context/authStore";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "../../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const estado = useAuthStore((s) => s.estado);
  const restaurarSesion = useAuthStore((s) => s.restaurarSesion);

  useEffect(() => {
    void restaurarSesion();
  }, [restaurarSesion]);

  useEffect(() => {
    if (estado !== "cargando") void SplashScreen.hideAsync();
  }, [estado]);

  if (estado === "cargando") return null;

  const autenticado = estado === "autenticado";

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={!autenticado}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={autenticado}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
      <ToastHost />
    </>
  );
}