// src/components/MenuLateral.tsx
import { useAuthStore } from "@/context/authStore";
import { COLOR_BRAND } from "@/utils/theme";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { urlArchivo } from "@/utils/archivo";
import type { ComponentProps } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];
type RutaMenu = "/inicio" | "/reservas" | "/disponibilidad" | "/perfil";

interface Opcion {
  titulo: string;
  icono: IconName;
  ruta: RutaMenu;
}

const OPCIONES_CLIENTE: Opcion[] = [
  { titulo: "Inicio", icono: "home-outline", ruta: "/inicio" },
  { titulo: "Mis reservas", icono: "calendar-outline", ruta: "/reservas" },
  { titulo: "Mi perfil", icono: "person-outline", ruta: "/perfil" },
];

const OPCIONES_TRABAJADOR: Opcion[] = [
  { titulo: "Mis reservas", icono: "calendar-outline", ruta: "/reservas" },
  { titulo: "Mi disponibilidad", icono: "time-outline", ruta: "/disponibilidad" },
  { titulo: "Mi perfil", icono: "person-outline", ruta: "/perfil" },
];

interface MenuLateralProps {
  visible: boolean;
  onClose: () => void;
}

export function MenuLateral({ visible, onClose }: MenuLateralProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const usuario = useAuthStore((s) => s.usuario);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);

  if (usuario === null) return null;

  const opciones = usuario.rol === "Cliente" ? OPCIONES_CLIENTE : OPCIONES_TRABAJADOR;

  const ir = (ruta: RutaMenu): void => {
    onClose();
    router.navigate(ruta);
  };

  const salir = (): void => {
    onClose();
    void cerrarSesion();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View className="flex-1 flex-row">
        <View
          className="w-72 bg-white px-5"
          style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
        >
          <View className="mb-4 flex-row items-center">
            <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-brand-light">
              {usuario.fotoPerfil ? (
                <Image source={{ uri: urlArchivo(usuario.fotoPerfil) ?? undefined }} style={{ width: 48, height: 48 }} contentFit="cover" transition={200} />
              ) : (
                <Ionicons name="person" size={24} color={COLOR_BRAND} />
              )}
            </View>
            <View className="ml-3 flex-1">
              <Text numberOfLines={1} className="text-base font-bold text-gray-900">
                {usuario.nombre}
              </Text>
              <Text className="text-xs text-gray-500">{usuario.rol}</Text>
            </View>
          </View>

          <View className="my-2 h-px bg-gray-200" />

          {opciones.map((o) => (
            <Pressable
              key={o.ruta}
              accessibilityRole="button"
              onPress={() => ir(o.ruta)}
              className="flex-row items-center rounded-xl px-2 py-3 active:bg-gray-100"
            >
              <Ionicons name={o.icono} size={22} color="#374151" />
              <Text className="ml-3 text-base text-gray-800">{o.titulo}</Text>
            </Pressable>
          ))}

          <View className="flex-1" />

          <Pressable
            accessibilityRole="button"
            onPress={salir}
            className="flex-row items-center rounded-xl px-2 py-3 active:bg-gray-100"
          >
            <Ionicons name="log-out-outline" size={22} color="#DC2626" />
            <Text className="ml-3 text-base font-medium text-red-600">Cerrar sesión</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityLabel="Cerrar menú"
          className="flex-1 bg-black/50"
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}