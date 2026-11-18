// src/components/Button.tsx
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";
import { COLOR_BRAND } from "@/utils/theme";

type Variante = "primario" | "secundario" | "peligro";

interface ButtonProps extends Omit<PressableProps, "children"> {
  titulo: string;
  variante?: Variante;
  cargando?: boolean;
}

const contenedor: Record<Variante, string> = {
  primario: "bg-brand",
  secundario: "border border-brand bg-white",
  peligro: "bg-red-600",
};

const texto: Record<Variante, string> = {
  primario: "text-white",
  secundario: "text-brand",
  peligro: "text-white",
};

export function Button({ titulo, variante = "primario", cargando = false, disabled, ...props }: ButtonProps) {
  const inactivo = disabled === true || cargando;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactivo}
      className={`h-12 w-full flex-row items-center justify-center rounded-full ${contenedor[variante]} ${
        inactivo ? "opacity-50" : "active:opacity-80"
      }`}
      {...props}
    >
      {cargando ? (
        <ActivityIndicator color={variante === "secundario" ? COLOR_BRAND : "#FFFFFF"} />
      ) : (
        <Text className={`text-base font-semibold ${texto[variante]}`}>{titulo}</Text>
      )}
    </Pressable>
  );
}
