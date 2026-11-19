// src/app/(app)/(tabs)/reservas.tsx
import { Button, Card, EstadoVacio, Header, Screen, SkeletonCard } from "@/components";
import { useAuthStore } from "@/context/authStore";
import { useReservas } from "@/hooks/useReservas";
import type { ReservaDto } from "@/types";
import { diaUTCDeApi, formatearFechaHoraApi, milisegundosReserva } from "@/utils/fechas";
import { formatMoneda } from "@/utils/moneda";
import { COLOR_BRAND } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, SectionList, Text, View } from "react-native";

const FILTROS_RESERVA = ["Todas", "Activas", "Finalizadas", "Canceladas"] as const;
type FiltroReserva = (typeof FILTROS_RESERVA)[number];

function FiltroPill({
  etiqueta,
  cantidad,
  activa,
  onPress,
}: {
  etiqueta: string;
  cantidad: number;
  activa: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activa }}
      onPress={onPress}
      className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-1.5 active:opacity-70 ${
        activa ? "border-brand bg-brand" : "border-gray-300 bg-white"
      }`}
    >
      <Text className={`text-sm font-medium ${activa ? "text-white" : "text-gray-700"}`}>
        {etiqueta}
      </Text>
      <View
        className={`min-w-[20px] items-center rounded-full px-1.5 ${
          activa ? "bg-white/25" : "bg-gray-100"
        }`}
      >
        <Text className={`text-[11px] font-bold ${activa ? "text-white" : "text-gray-500"}`}>
          {cantidad}
        </Text>
      </View>
    </Pressable>
  );
}

function getEstadoBadge(estado: ReservaDto["estado"]) {
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
}

export default function Reservas() {
  const router = useRouter();
  const esTrabajador = useAuthStore((s) => s.usuario?.rol) === "Trabajador";
  const { reservas, cargando, refrescando, error, refrescar, reintentar } = useReservas();
  const [filtro, setFiltro] = useState<FiltroReserva>("Todas");

  const contadores: Record<FiltroReserva, number> = {
    Todas: reservas.length,
    Activas: reservas.filter((r) => r.estado === "Pendiente" || r.estado === "EnCurso").length,
    Finalizadas: reservas.filter((r) => r.estado === "Finalizado").length,
    Canceladas: reservas.filter((r) => r.estado === "Cancelado").length,
  };

  const filtradas = useMemo(() => {
    switch (filtro) {
      case "Activas":
        return reservas.filter((r) => r.estado === "Pendiente" || r.estado === "EnCurso");
      case "Finalizadas":
        return reservas.filter((r) => r.estado === "Finalizado");
      case "Canceladas":
        return reservas.filter((r) => r.estado === "Cancelado");
      default:
        return reservas;
    }
  }, [reservas, filtro]);

  const secciones = useMemo(() => {
    const ahora = new Date();
    const inicioHoy = Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const hoy: ReservaDto[] = [];
    const proximas: ReservaDto[] = [];
    const anteriores: ReservaDto[] = [];

    for (const reserva of filtradas) {
      const dia = diaUTCDeApi(reserva.fecha);
      if (dia < inicioHoy) anteriores.push(reserva);
      else if (dia === inicioHoy) hoy.push(reserva);
      else proximas.push(reserva);
    }

    const porFecha = (a: ReservaDto, b: ReservaDto) =>
      milisegundosReserva(a.fecha, a.hora) - milisegundosReserva(b.fecha, b.hora);

    hoy.sort(porFecha);
    proximas.sort(porFecha);
    anteriores.sort((a, b) => porFecha(b, a));

    return [
      { titulo: "Hoy", data: hoy },
      { titulo: "Próximas", data: proximas },
      { titulo: "Anteriores", data: anteriores },
    ].filter((seccion) => seccion.data.length > 0);
  }, [filtradas]);

  const irASolicitar = (): void => {
    if (esTrabajador) router.push("/(app)/(tabs)/disponibilidad");
    else router.push("/(app)/(tabs)/inicio");
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
              <Text className={`text-xs font-bold ${badge.text}`}>{badge.label}</Text>
            </View>
          </View>

          {item.nombreTrabajador ? (
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Ionicons name="person-outline" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-500 font-medium">{item.nombreTrabajador}</Text>
            </View>
          ) : null}

          <View className="flex-row items-center gap-1.5 mt-1">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600">
              {formatearFechaHoraApi(item.fecha, item.hora)}
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
            <Text className="text-base font-bold text-brand">{formatMoneda(item.precioTotal)}</Text>
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
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerClassName="gap-2 pb-3 pt-1"
          >
            {FILTROS_RESERVA.map((opcion) => (
              <FiltroPill
                key={opcion}
                etiqueta={opcion}
                cantidad={contadores[opcion]}
                activa={filtro === opcion}
                onPress={() => setFiltro(opcion)}
              />
            ))}
          </ScrollView>

          <SectionList
            sections={secciones}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            renderSectionHeader={({ section }) => (
              <Text className="mb-2 mt-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                {section.titulo} · {section.data.length}
              </Text>
            )}
            contentContainerClassName="pb-8"
            stickySectionHeadersEnabled={false}
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={refrescar}
                colors={[COLOR_BRAND]}
              />
            }
            ListEmptyComponent={
              <View>
                <EstadoVacio
                  icono="calendar-outline"
                  titulo={
                    filtro === "Todas"
                      ? "No tienes reservas aún"
                      : `Sin reservas ${filtro.toLowerCase()}`
                  }
                  mensaje={
                    filtro === "Todas"
                      ? "Explora nuestros servicios y realiza tu primera solicitud."
                      : "Prueba con otro filtro para ver tus reservas."
                  }
                />
                <Button
                  titulo={
                    filtro === "Todas"
                      ? esTrabajador
                        ? "Revisar mi disponibilidad"
                        : "Solicitar un servicio"
                      : "Ver todas"
                  }
                  variante="secundario"
                  onPress={filtro === "Todas" ? irASolicitar : () => setFiltro("Todas")}
                />
              </View>
            }
          />
        </>
      )}
    </Screen>
  );
}
