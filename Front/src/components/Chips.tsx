// src/components/Chips.tsx
import { Pressable, Text, View } from "react-native";

interface ChipsProps<T extends string> {
  opciones: readonly T[];
  seleccionada: T;
  onChange: (valor: T) => void;
}

export function Chips<T extends string>({ opciones, seleccionada, onChange }: ChipsProps<T>) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {opciones.map((opcion) => {
        const activa = opcion === seleccionada;
        return (
          <Pressable
            key={opcion}
            accessibilityRole="button"
            accessibilityState={{ selected: activa }}
            onPress={() => onChange(opcion)}
            className={`rounded-full border px-4 py-1.5 ${
              activa ? "border-brand bg-brand" : "border-gray-300 bg-white"
            }`}
          >
            <Text className={`text-sm font-medium ${activa ? "text-white" : "text-gray-700"}`}>{opcion}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}