// src/app/(app)/(tabs)/reservas.tsx
import { Button, Card, EstadoVacio, Header, Screen, SkeletonCard } from "@/components";
import { useReservas } from "@/hooks/useReservas";
import type { ReservaDto } from "@/types";
import { formatearFechaApi } from "@/utils/fechas";
import { formatMoneda } from "@/utils/moneda";
import { COLOR_BRAND } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";

export default function Reservas() {
  const router = useRouter();
  const { reservas, cargando, refrescando, error, refrescar, reintentar } = useReservas();

  const getEstadoBadge = (estado: ReservaDto["estado"]) => {
    switch (estado) {
      case "Pendiente":
        return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pendiente" };
      case "EnCurso":
        return { bg: "bg-blue-100", text: "text-blue-800", label: "En Curso" };
      case "Finalizado":
        return { bg: "bg-brand-light", text: "text-brand-dark", label: "Finalizado" };
      case "Cancelado":
        return { bg: "bg-red-100", text: "text-red-800", label: "Cancelado" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", label: estado };
    }
  };

  const renderItem = ({ item }: { item: ReservaDto }) => {
    const badge = getEstadoBadge(item.estado);

    return (
      <Pressable
        onPress={() => router.push(`/(app)/reserva/${item.id}`)}
        className="active:opacity-80 mb-3"
      >
        <Card className="p-4 gap-2 border border-gray-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>
              {item.nombreServicio || "Servicio Agendado"}
            </Text>
            <View className={`px-2.5 py-1 rounded-full ${badge.bg}`}>
              <Text className={`text-xs font-bold ${badge.text}`}>
                {badge.label}
              </Text>
            </View>
          </View>

          {item.nombreTrabajador ? (
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Ionicons name="person-outline" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-500 font-medium">
                {item.nombreTrabajador}
              </Text>
            </View>
          ) : null}

          <View className="flex-row items-center gap-1.5 mt-1">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600">
              {formatearFechaApi(item.fecha)} a las {item.hora.slice(0, 5)}
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5">
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600" numberOfLines={1}>
              {item.direccion}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-100">
            <Text className="text-xs text-gray-400">
              {item.estado === "Finalizado" ? "Total pagado" : "Total"}
            </Text>
            <Text className="text-base font-bold text-brand">
              {formatMoneda(item.precioTotal)}
            </Text>
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <Screen>
      <Header titulo="Mis Reservas" tituloVerde />

      {cargando ? (
        <View className="p-4 gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-4 gap-4">
          <EstadoVacio
            icono="alert-circle-outline"
            titulo="Error al cargar reservas"
            mensaje={error}
          />
          <Button titulo="Reintentar" variante="secundario" onPress={() => void reintentar()} />
        </View>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerClassName="p-4 pb-8"
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={[COLOR_BRAND]} />
          }
          ListEmptyComponent={
            <EstadoVacio
              icono="calendar-outline"
              titulo="No tienes reservas aún"
              mensaje="Explora nuestros servicios en el Inicio y realiza tu primera solicitud."
            />
          }
        />
      )}
    </Screen>
  );
}