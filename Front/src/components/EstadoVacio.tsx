// src/components/EstadoVacio.tsx
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import { COLOR_BRAND } from "@/utils/theme";

interface EstadoVacioProps {
  icono: ComponentProps<typeof Ionicons>["name"];
  titulo: string;
  mensaje?: string;
}

export function EstadoVacio({ icono, titulo, mensaje }: EstadoVacioProps) {
  return (
    <View className="items-center justify-center px-8 py-12">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-light">
        <Ionicons name={icono} size={28} color={COLOR_BRAND} />
      </View>
      <Text className="mt-4 text-center text-base font-semibold text-gray-900">{titulo}</Text>
      {mensaje ? <Text className="mt-1 text-center text-sm text-gray-500">{mensaje}</Text> : null}
    </View>
  );
}