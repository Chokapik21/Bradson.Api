// src/components/ServicioResumen.tsx
import type { ServicioDto } from "@/types";
import { categoriaDe } from "@/utils/categorias";
import { formatMoneda } from "@/utils/moneda";
import { COLOR_BRAND } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Card } from "./Card";
import { ICONOS_CATEGORIA } from "./ServicioCard";

export function ServicioResumen({ servicio }: { servicio: ServicioDto }) {
  return (
    <Card className="flex-row items-center">
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-brand-light">
        <Ionicons name={ICONOS_CATEGORIA[categoriaDe(servicio)]} size={24} color={COLOR_BRAND} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-base font-bold text-gray-900">{servicio.nombreCategoria}</Text>
        <Text className="text-xs text-gray-500">Tarifa base {formatMoneda(servicio.tarifaBase)}</Text>
      </View>
    </Card>
  );
}