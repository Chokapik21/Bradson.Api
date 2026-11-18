// src/components/Screen.tsx
import type { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

interface ScreenProps {
  children: ReactNode;
  edges?: Edge[];
  sinPadding?: boolean;
}

// Respeta las zonas seguras (notch, barra de estado). Uso style y no className en
// SafeAreaView porque ese componente es de una librería externa, no de React Native.
export function Screen({ children, edges = ["top", "left", "right"], sinPadding = false }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className={sinPadding ? "flex-1" : "flex-1 px-5"}>{children}</View>
    </SafeAreaView>
  );
}