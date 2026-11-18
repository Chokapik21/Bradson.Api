// src/components/Card.tsx
import { View, type ViewProps } from "react-native";

export function Card({ className = "", ...props }: ViewProps) {
  return <View className={`rounded-2xl border border-gray-200 bg-white p-4 ${className}`} {...props} />;
}