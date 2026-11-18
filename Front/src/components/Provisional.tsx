// src/components/Provisional.tsx
import { Text } from "react-native";
import { Screen } from "./Screen";

// Pantalla de relleno. Se borra cuando termine la Fase 7.
export function Provisional({ titulo }: { titulo: string }) {
  return (
    <Screen>
      <Text className="mt-6 text-2xl font-bold text-brand">{titulo}</Text>
      <Text className="mt-2 text-gray-500">Pantalla provisional, se construye en la Fase 7.</Text>
    </Screen>
  );
}