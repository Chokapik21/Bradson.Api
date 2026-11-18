// src/app/index.tsx
import { Redirect } from "expo-router";
import { useAuthStore } from "@/context/authStore";

// Puerta de entrada: manda a cada quien a su pantalla según la sesión.
export default function Raiz() {
  const usuario = useAuthStore((s) => s.usuario);

  if (usuario === null) return <Redirect href="/login" />;
  return <Redirect href="/inicio" />;
}