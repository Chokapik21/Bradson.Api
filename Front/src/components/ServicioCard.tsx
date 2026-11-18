// src/components/ServicioCard.tsx
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import type { ServicioDto } from "@/types";
import { categoriaDe, type Categoria } from "@/utils/categorias";
import { formatMoneda } from "@/utils/moneda";
import { COLOR_BRAND } from "@/utils/theme";
import { Card } from "./Card";

const iconos: Record<Categoria, ComponentProps<typeof Ionicons>["name"]> = {
  Limpieza: "home-outline",
  Decoración: "color-palette-outline",
};

interface ServicioCardProps {
  servicio: ServicioDto;
  onSolicitar: (servicio: ServicioDto) => void;
}

export function ServicioCard({ servicio, onSolicitar }: ServicioCardProps) {
  return (
    <Card>
      <View className="flex-row">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-brand-light">
          <Ionicons name={iconos[categoriaDe(servicio)]} size={24} color={COLOR_BRAND} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-base font-bold text-gray-900">{servicio.nombreCategoria}</Text>
          <Text numberOfLines={2} className="mt-0.5 text-xs text-gray-500">
            {servicio.descripcion}
          </Text>
        </View>
      </View>

      <View className="my-3 h-px bg-gray-200" />

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-gray-500">Tarifa base</Text>
          <Text className="text-lg font-bold text-brand">{formatMoneda(servicio.tarifaBase)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => onSolicitar(servicio)}
          className="rounded-full bg-brand-light px-5 py-2 active:opacity-80"
        >
          <Text className="text-sm font-semibold text-brand-dark">Solicitar</Text>
        </Pressable>
      </View>
    </Card>
  );
}