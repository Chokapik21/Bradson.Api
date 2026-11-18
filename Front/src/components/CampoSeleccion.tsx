// src/components/CampoSeleccion.tsx
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

interface CampoSeleccionProps {
  icono: ComponentProps<typeof Ionicons>["name"];
  valor: string | null;
  placeholder: string;
  onPress: () => void;
  error?: string;
}

// Se ve como un Input, pero al tocarlo abre algo (selector, mapa) en lugar del teclado.
export function CampoSeleccion({ icono, valor, placeholder, onPress, error }: CampoSeleccionProps) {
  return (
    <View className="w-full">
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className={`h-12 flex-row items-center rounded-full bg-gray-200 px-4 active:opacity-80 ${
          error ? "border border-red-500" : ""
        }`}
      >
        <Ionicons name={icono} size={18} color="#6B7280" />
        <Text numberOfLines={1} className={`ml-2 flex-1 text-base ${valor ? "text-gray-900" : "text-gray-400"}`}>
          {valor ?? placeholder}
        </Text>
      </Pressable>
      {error ? <Text className="mt-1 px-2 text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}