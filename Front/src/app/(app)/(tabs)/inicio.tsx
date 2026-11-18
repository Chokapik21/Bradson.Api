// src/app/(app)/(tabs)/inicio.tsx
import { ApiError, disponibilidadesApi, reservasApi } from "@/api";
import { Button, Chips, EstadoVacio, HeaderApp, Input, Screen, ServicioCard, SkeletonCard } from "@/components";
import { useAuthStore } from "@/context/authStore";
import { useServicios } from "@/hooks/useServicios";
import type { ReservaDto, ServicioDto } from "@/types";
import { categoriaDe, FILTROS, normalizar, type FiltroCategoria } from "@/utils/categorias";
import { formatearFechaApi } from "@/utils/fechas";
import { formatMoneda } from "@/utils/moneda";
import { COLOR_BRAND } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, Text, View, ActivityIndicator } from "react-native";

const Separador = () => <View className="h-3" />;

export default function Inicio() {
  const rol = useAuthStore((s) => s.usuario?.rol);

  if (rol === undefined) return null;
  if (rol === "Trabajador") return <DashboardTrabajador />;
  return <Catalogo />;
}

// ─── Vista del Cliente: catálogo de servicios ────────────────────────────────
function Catalogo() {
  const { servicios, cargando, refrescando, error, refrescar, reintentar } = useServicios();
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroCategoria>("Todos");

  const filtrados = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    return servicios.filter((s) => {
      const coincideCategoria = filtro === "Todos" || categoriaDe(s) === filtro;
      const coincideTexto =
        termino === "" || normalizar(`${s.nombreCategoria} ${s.descripcion}`).includes(termino);
      return coincideCategoria && coincideTexto;
    });
  }, [servicios, busqueda, filtro]);

  const solicitar = (servicio: ServicioDto): void => {
    router.push({ pathname: "/nueva-reserva", params: { servicioId: String(servicio.id) } });
  };

  const encabezado = (
    <View className="pb-3">
      <Input
        icono="search-outline"
        placeholder="Buscar servicios..."
        value={busqueda}
        onChangeText={setBusqueda}
        autoCorrect={false}
        returnKeyType="search"
      />
      <Text className="mb-2 mt-5 text-base font-bold text-gray-900">Categorías</Text>
      <Chips opciones={FILTROS} seleccionada={filtro} onChange={setFiltro} />
      <Text className="mb-1 mt-6 text-base font-bold text-gray-900">Servicios Populares</Text>
    </View>
  );

  const vacio = cargando ? (
    <View className="gap-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  ) : error !== null ? (
    <View>
      <EstadoVacio icono="cloud-offline-outline" titulo="No pudimos cargar los servicios" mensaje={error} />
      <Button titulo="Reintentar" variante="secundario" onPress={() => void reintentar()} />
    </View>
  ) : servicios.length === 0 ? (
    <EstadoVacio icono="albums-outline" titulo="Aún no hay servicios disponibles" mensaje="Vuelve a intentarlo más tarde." />
  ) : (
    <EstadoVacio icono="search-outline" titulo="No encontramos resultados" mensaje="Prueba con otra búsqueda o categoría." />
  );

  return (
    <Screen>
      <HeaderApp titulo="Bradson" tituloVerde mostrarMenu mostrarNotificacion />
      <FlatList
        data={cargando ? [] : filtrados}
        keyExtractor={(s) => String(s.id)}
        renderItem={({ item }) => <ServicioCard servicio={item} onSolicitar={solicitar} />}
        ItemSeparatorComponent={Separador}
        ListHeaderComponent={encabezado}
        ListEmptyComponent={vacio}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => void refrescar()} colors={[COLOR_BRAND]} />}
        contentContainerClassName="pb-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

// ─── Vista del Trabajador: panel operativo ───────────────────────────────────
function DashboardTrabajador() {
  const usuario = useAuthStore((s) => s.usuario);
  const router = useRouter();

  const [reservas, setReservas] = useState<ReservaDto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sinHorarios, setSinHorarios] = useState(false);
  const [procesando, setProcesando] = useState<number | null>(null);

  const sinUbicacion = !usuario?.latitud || !usuario?.longitud;

  const cargar = useCallback((): void => {
    setCargando(true);
    setError(null);

    Promise.all([
      reservasApi.listar(),
      disponibilidadesApi.listar(),
    ])
      .then(([res, disp]) => {
        setReservas(res);
        setSinHorarios(disp.length === 0);
      })
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? e.message : "Error al cargar datos.");
      })
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiarEstado = async (reserva: ReservaDto, nuevoEstado: "EnCurso" | "Finalizado"): Promise<void> => {
    const accion = nuevoEstado === "EnCurso" ? "iniciar" : "finalizar";
    const nombre = reserva.nombreServicio ? `de ${reserva.nombreServicio}` : "asignado";
    Alert.alert(
      `¿${nuevoEstado === "EnCurso" ? "Iniciar" : "Finalizar"} servicio?`,
      `¿Confirmas que deseas ${accion} el servicio ${nombre}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "default",
          onPress: async () => {
            setProcesando(reserva.id);
            try {
              await reservasApi.cambiarEstado(reserva.id, { estado: nuevoEstado });
              setReservas((prev) =>
                prev.map((r) => (r.id === reserva.id ? { ...r, estado: nuevoEstado } : r))
              );
            } catch (e) {
              Alert.alert(
                "Error",
                e instanceof ApiError ? e.message : "No se pudo cambiar el estado."
              );
            } finally {
              setProcesando(null);
            }
          },
        },
      ]
    );
  };

  // KPIs
  const pendientes = reservas.filter((r) => r.estado === "Pendiente").length;
  const enCurso = reservas.filter((r) => r.estado === "EnCurso").length;
  const finalizados = reservas.filter((r) => r.estado === "Finalizado").length;

  // Solo las activas para el listado principal
  const activas = reservas.filter((r) => r.estado === "Pendiente" || r.estado === "EnCurso");

  return (
    <Screen>
      <HeaderApp titulo="Panel de Trabajo" tituloVerde mostrarMenu />

      <FlatList
        data={cargando ? [] : activas}
        keyExtractor={(r) => String(r.id)}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={cargar} colors={[COLOR_BRAND]} />
        }
        ListHeaderComponent={
          <View className="px-4 pt-2 pb-3">
            {/* Alertas de configuración */}
            {sinUbicacion && (
              <Pressable
                onPress={() => router.push("/(app)/(tabs)/perfil")}
                className="mb-3 flex-row items-center gap-3 rounded-2xl border border-yellow-300 bg-yellow-50 p-3 active:opacity-70"
              >
                <Ionicons name="location-outline" size={20} color="#B45309" />
                <View className="flex-1">
                  <Text className="text-sm font-bold text-yellow-800">Sin ubicación base</Text>
                  <Text className="text-xs text-yellow-700">
                    Configura tu zona de trabajo en Perfil para aparecer en el radar de clientes.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#B45309" />
              </Pressable>
            )}
            {sinHorarios && (
              <Pressable
                onPress={() => router.push("/(app)/(tabs)/disponibilidad")}
                className="mb-3 flex-row items-center gap-3 rounded-2xl border border-blue-300 bg-blue-50 p-3 active:opacity-70"
              >
                <Ionicons name="time-outline" size={20} color="#1D4ED8" />
                <View className="flex-1">
                  <Text className="text-sm font-bold text-blue-800">Sin horarios registrados</Text>
                  <Text className="text-xs text-blue-700">
                    Agrega tus franjas disponibles en la pestaña Disponibilidad.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#1D4ED8" />
              </Pressable>
            )}

            {/* KPIs */}
            <View className="flex-row gap-3 mb-4">
              <KpiCard valor={pendientes} etiqueta="Pendientes" color="text-yellow-700" fondo="bg-yellow-50" />
              <KpiCard valor={enCurso} etiqueta="En Curso" color="text-blue-700" fondo="bg-blue-50" />
              <KpiCard valor={finalizados} etiqueta="Finalizados" color="text-brand" fondo="bg-brand-light" />
            </View>

            <Text className="text-base font-bold text-gray-900 mb-2">Servicios Activos</Text>

            {/* Estado de error */}
            {error !== null && (
              <View>
                <EstadoVacio icono="cloud-offline-outline" titulo="Error al cargar" mensaje={error} />
                <Button titulo="Reintentar" variante="secundario" onPress={cargar} />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          cargando ? (
            <View className="px-4 gap-3">
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : error === null ? (
            <EstadoVacio
              icono="checkmark-circle-outline"
              titulo="Sin servicios activos"
              mensaje="No tienes reservas pendientes ni en curso en este momento."
            />
          ) : undefined
        }
        renderItem={({ item }) => (
          <View className="px-4 mb-3">
            <ReservaActivaCard
              reserva={item}
              procesando={procesando === item.id}
              onCambiar={cambiarEstado}
            />
          </View>
        )}
      />
    </Screen>
  );
}

// ─── Tarjeta de KPI ──────────────────────────────────────────────────────────
function KpiCard({
  valor,
  etiqueta,
  color,
  fondo,
}: {
  valor: number;
  etiqueta: string;
  color: string;
  fondo: string;
}) {
  return (
    <View className={`flex-1 items-center rounded-2xl ${fondo} py-3`}>
      <Text className={`text-2xl font-extrabold ${color}`}>{valor}</Text>
      <Text className="text-xs text-gray-600 mt-0.5">{etiqueta}</Text>
    </View>
  );
}

// ─── Tarjeta de reserva activa del Trabajador ────────────────────────────────
function ReservaActivaCard({
  reserva,
  procesando,
  onCambiar,
}: {
  reserva: ReservaDto;
  procesando: boolean;
  onCambiar: (r: ReservaDto, estado: "EnCurso" | "Finalizado") => Promise<void>;
}) {
  const esPendiente = reserva.estado === "Pendiente";
  const esEnCurso = reserva.estado === "EnCurso";

  const badgeCls = esPendiente
    ? { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pendiente" }
    : { bg: "bg-blue-100", text: "text-blue-800", label: "En Curso" };

  return (
    <View className="rounded-2xl border border-gray-100 bg-white p-4 gap-3 shadow-sm">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>
          {reserva.nombreServicio || "Servicio Asignado"}
        </Text>
        <View className={`px-2.5 py-1 rounded-full ${badgeCls.bg}`}>
          <Text className={`text-xs font-bold ${badgeCls.text}`}>{badgeCls.label}</Text>
        </View>
      </View>

      {reserva.nombreCliente ? (
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text className="text-sm text-gray-700 font-medium">
            Cliente: {reserva.nombreCliente}
          </Text>
        </View>
      ) : null}

      <View className="flex-row items-center gap-1.5">
        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
        <Text className="text-sm text-gray-600">
          {formatearFechaApi(reserva.fecha)} a las {reserva.hora.slice(0, 5)}
        </Text>
      </View>

      <View className="flex-row items-center gap-1.5">
        <Ionicons name="location-outline" size={14} color="#6B7280" />
        <Text className="text-sm text-gray-600 flex-1" numberOfLines={1}>
          {reserva.direccion}
        </Text>
      </View>

      <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
        <Text className="text-base font-bold text-brand">{formatMoneda(reserva.precioTotal)}</Text>
        {esPendiente && (
          <Pressable
            disabled={procesando}
            onPress={() => void onCambiar(reserva, "EnCurso")}
            className="flex-row items-center justify-center px-4 py-2 rounded-full bg-brand active:opacity-80"
          >
            {procesando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-xs font-bold text-white">Iniciar servicio</Text>
            )}
          </Pressable>
        )}
        {esEnCurso && (
          <Pressable
            disabled={procesando}
            onPress={() => void onCambiar(reserva, "Finalizado")}
            className="flex-row items-center justify-center px-4 py-2 rounded-full bg-red-600 active:opacity-80"
          >
            {procesando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-xs font-bold text-white">Finalizar servicio</Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}
