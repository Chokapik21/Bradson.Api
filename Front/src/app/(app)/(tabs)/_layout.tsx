//src/app/(app)/(tabs)/_layout.tsx
import { useAuthStore } from "@/context/authStore";
import { COLOR_BRAND } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const icono =
  (activo: IconName, inactivo: IconName) =>
  ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons
      name={focused ? activo : inactivo}
      size={size}
      color={typeof color === "string" ? color : undefined}
    />
  );

export default function TabsLayout() {
  const rol = useAuthStore((s) => s.usuario?.rol);
  const esCliente = rol === "Cliente";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLOR_BRAND,
        tabBarInactiveTintColor: "#6B7280",
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{ title: "Inicio", href: esCliente ? undefined : null, tabBarIcon: icono("home", "home-outline") }}
      />
      <Tabs.Screen
        name="reservas"
        options={{ title: "Reservas", tabBarIcon: icono("calendar", "calendar-outline") }}
      />
      <Tabs.Screen
        name="disponibilidad"
        options={{
          title: "Disponibilidad",
          href: esCliente ? null : undefined,
          tabBarIcon: icono("time", "time-outline"),
        }}
      />
      <Tabs.Screen name="perfil" options={{ title: "Perfil", tabBarIcon: icono("person", "person-outline") }} />
    </Tabs>
  );
}