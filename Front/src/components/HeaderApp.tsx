// src/components/HeaderApp.tsx
import { useNotificaciones, type TonoNotificacion } from "@/hooks/useNotificaciones";
import { COLOR_BRAND } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { AppModal } from "./AppModal";
import { Button } from "./Button";
import { EstadoVacio } from "./EstadoVacio";
import { Header } from "./Header";
import { MenuLateral } from "./MenuLateral";

// Reutilizamos las propiedades existentes de Header.
type HeaderAppProps = ComponentProps<typeof Header>;

const ESTILOS_TONO: Record<TonoNotificacion, { fondo: string; color: string }> = {
  info: { fondo: "bg-blue-50", color: "#2563EB" },
  alerta: { fondo: "bg-yellow-50", color: "#B45309" },
  exito: { fondo: "bg-brand-light", color: COLOR_BRAND },
};

export function HeaderApp({
  titulo = "Bradson",
  ...props
}: HeaderAppProps) {
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const { notificaciones } = useNotificaciones();

  return (
    <>
      <Header
        {...props}
        titulo={titulo}
        tituloVerde
        mostrarMenu
        mostrarNotificacion
        puntoNotificacion={notificaciones.length > 0}
        onPressMenu={() => setMenuAbierto(true)}
        onPressNotificacion={() => setNotificacionesAbiertas(true)}
      />

      <MenuLateral
        visible={menuAbierto}
        onClose={() => setMenuAbierto(false)}
      />

      <AppModal
        visible={notificacionesAbiertas}
        titulo={
          notificaciones.length > 0
            ? `Notificaciones (${notificaciones.length})`
            : "Notificaciones"
        }
        onClose={() => setNotificacionesAbiertas(false)}
      >
        {notificaciones.length === 0 ? (
          <EstadoVacio
            icono="notifications-off-outline"
            titulo="No tienes notificaciones"
            mensaje="Cuando haya novedades sobre tus reservas, aparecerán aquí."
          />
        ) : (
          <ScrollView
            className="max-h-80"
            contentContainerClassName="gap-2"
            showsVerticalScrollIndicator={false}
          >
            {notificaciones.map((notificacion) => {
              const estilo = ESTILOS_TONO[notificacion.tono];
              return (
                <Pressable
                  key={notificacion.id}
                  accessibilityRole="button"
                  onPress={() => {
                    setNotificacionesAbiertas(false);
                    router.push(notificacion.ruta);
                  }}
                  className="flex-row items-center gap-3 rounded-xl border border-gray-100 p-3 active:bg-gray-50"
                >
                  <View
                    className={`h-9 w-9 items-center justify-center rounded-full ${estilo.fondo}`}
                  >
                    <Ionicons name={notificacion.icono} size={18} color={estilo.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-900">
                      {notificacion.titulo}
                    </Text>
                    <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={2}>
                      {notificacion.mensaje}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <View className="mt-4">
          <Button
            titulo="Cerrar"
            variante="secundario"
            onPress={() => setNotificacionesAbiertas(false)}
          />
        </View>
      </AppModal>
    </>
  );
}
