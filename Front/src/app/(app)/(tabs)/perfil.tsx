// src/app/(app)/(tabs)/perfil.tsx
import { Text, View } from "react-native";
import { Button, Card, Screen } from "@/components";
import { useAuthStore } from "@/context/authStore";

export default function Perfil() {
  const usuario = useAuthStore((s) => s.usuario);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);

  if (usuario === null) return null;

  return (
    <Screen>
      <Text className="mt-6 text-2xl font-bold text-brand">Perfil</Text>
      <Card className="mt-4 gap-1">
        <Text className="text-base font-semibold text-gray-900">{usuario.nombre}</Text>
        <Text className="text-gray-500">{usuario.correo}</Text>
        <Text className="text-gray-500">{usuario.rol}</Text>
      </Card>
      <View className="mt-6">
        <Button titulo="Cerrar sesión" variante="secundario" onPress={() => void cerrarSesion()} />
      </View>
    </Screen>
  );
}
