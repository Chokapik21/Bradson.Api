// src/app/(app)/reserva/[id].tsx
import { ApiError, calificacionesApi, pagosApi, reservasApi } from "@/api";
import { Button, Card, Header, Screen, toast } from "@/components";
import { useReservaStore } from "@/context/reservaStore";
import { useReserva } from "@/hooks/useReserva";
import type { CalificacionDto } from "@/types";
import { formatearFechaApi } from "@/utils/fechas";
import { formatMoneda } from "@/utils/moneda";
import { COLOR_BRAND } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";

export default function DetalleReserva() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reservaId = Number(id);
  const router = useRouter();

  const { reserva, pago, cargando, setReserva, setPago } = useReserva(reservaId);
  const [procesando, setProcesando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [calificacion, setCalificacion] = useState<CalificacionDto | null>(null);
  const metodo = useReservaStore((s) => s.metodosPago[reservaId]) ?? "Tarjeta";

  const puedeSimular =
    reserva?.estado === "Pendiente" || reserva?.estado === "EnCurso";

  useEffect(() => {
    if (reserva?.estado !== "Finalizado") {
      setCalificacion(null);
      return;
    }
    let activo = true;
    calificacionesApi
      .listar()
      .then((lista) => {
        if (!activo) return;
        setCalificacion(lista.find((c) => c.idReserva === reservaId) ?? null);
      })
      .catch(() => {
        if (activo) setCalificacion(null);
      });
    return () => {
      activo = false;
    };
  }, [reserva?.estado, reservaId]);

  if (cargando) {
    return (
      <Screen>
        <Header mostrarAtras titulo="¡Éxito!" tituloVerde />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Cargando detalles de la reserva...</Text>
        </View>
      </Screen>
    );
  }

  if (!reserva) {
    return (
      <Screen>
        <Header mostrarAtras titulo="¡Éxito!" tituloVerde />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Reserva no encontrada</Text>
        </View>
      </Screen>
    );
  }

  const simularServicioTerminado = async (): Promise<void> => {
    setProcesando(true);
    let estado = reserva.estado;
    try {
      // Cada paso se salta si ya está hecho: así se puede reintentar sin trabarse.
      if (estado === "Pendiente") {
        await reservasApi.cambiarEstado(reservaId, { estado: "EnCurso" });
        estado = "EnCurso";
        setReserva({ ...reserva, estado });
      }
      if (estado === "EnCurso") {
        await reservasApi.cambiarEstado(reservaId, { estado: "Finalizado" });
        estado = "Finalizado";
        setReserva({ ...reserva, estado });
      }

      const nuevoPago = await pagosApi.obtenerPorReserva(reservaId);
      // forzarExito=true: es un botón de simulación, así la demo no depende del 10 % aleatorio.
      const pagoProcesado =
        nuevoPago.estadoPago === "Pendiente"
          ? await pagosApi.procesar(nuevoPago.id, { metodoPago: metodo }, true)
          : nuevoPago;
      setPago(pagoProcesado);

      if (pagoProcesado.estadoPago === "Fallido") {
        toast.error("El pago fue rechazado por la pasarela.");
        return;
      }
      toast.exito("Servicio finalizado y pago procesado");
      router.push({
        pathname: "/calificacion",
        params: { reservaId: String(reservaId), trabajadorId: String(reserva.idTrabajador) },
      });
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Error al simular el proceso.");
    } finally {
      setProcesando(false);
    }
  };

  const cancelarReserva = (): void => {
    Alert.alert(
      "¿Cancelar reserva?",
      "¿Estás seguro de que deseas cancelar este servicio?",
      [
        { text: "No, mantener", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            setCancelando(true);
            try {
              await reservasApi.cambiarEstado(reservaId, { estado: "Cancelado" });
              setReserva({ ...reserva, estado: "Cancelado" });
              toast.info("Reserva cancelada exitosamente.");
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : "No se pudo cancelar la reserva.");
            } finally {
              setCancelando(false);
            }
          },
        },
      ]
    );
  };

  const nombreTrabajador = reserva?.nombreTrabajador || "Trabajador asignado";
  const telefonoTrabajador = reserva?.telefonoTrabajador;

  return (
    <Screen>
      <Header mostrarAtras titulo="¡Éxito!" tituloVerde />

      <ScrollView className="flex-1" contentContainerClassName="pb-8 pt-4" showsVerticalScrollIndicator={false}>
        {/* Confirmación central */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-brand-light items-center justify-center mb-4">
            <Ionicons name="checkmark" size={40} color={COLOR_BRAND} />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-1 text-center">
            ¡Reserva Confirmada!
          </Text>
          <Text className="text-sm text-gray-500 text-center px-4">
            Tu trabajador ha sido asignado y llegará en la fecha y hora acordada.
          </Text>
        </View>

        {/* Tarjeta de Trabajador Asignado */}
        <Card className="p-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
                <Ionicons name="person" size={24} color="#6B7280" />
              </View>
              <View>
                <Text className="text-base font-bold text-gray-900">{nombreTrabajador}</Text>
                <Text className="text-xs text-gray-500">Trabajador asignado</Text>
              </View>
            </View>
            <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-full">
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text className="text-xs font-bold text-yellow-700 ml-1">4.8</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <Pressable
              disabled={!telefonoTrabajador}
              onPress={() => void Linking.openURL(`tel:${telefonoTrabajador ?? ""}`)}
              className={`h-10 flex-1 flex-row items-center justify-center gap-2 rounded-full border border-brand ${telefonoTrabajador ? "active:opacity-80" : "opacity-50"
                }`}
            >
              <Ionicons name="call-outline" size={16} color={COLOR_BRAND} />
              <Text className="text-sm font-semibold text-brand">Llamar</Text>
            </Pressable>

            <Pressable
              disabled
              className="h-10 flex-1 flex-row items-center justify-center gap-2 rounded-full border border-gray-300 opacity-50"
            >
              <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-500">Mensaje</Text>
            </Pressable>
          </View>
        </Card>

        {/* Resumen de la reserva */}
        <Card className="p-4 mb-6 gap-2">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            Detalles del Servicio
          </Text>
          {reserva.nombreServicio ? (
            <Text className="text-base font-bold text-gray-900 mb-1">
              {reserva.nombreServicio}
            </Text>
          ) : null}
          <Text className="text-sm text-gray-700">
            Fecha: {formatearFechaApi(reserva.fecha)} a las {reserva.hora.slice(0, 5)}
          </Text>
          <Text className="text-sm text-gray-700">Dirección: {reserva.direccion}</Text>
          <Text className="text-sm font-bold text-gray-900 mt-2">
            Total: {formatMoneda(reserva.precioTotal)}
          </Text>
          {pago && (
            <Text
              className={`text-xs font-bold mt-1 ${pago.estadoPago === "Fallido" ? "text-red-600" : "text-brand"
                }`}
            >
              Pago: {pago.estadoPago} ({pago.metodoPago})
            </Text>
          )}
        </Card>

        {/* Acciones inferiores */}
        {puedeSimular && (
          <View className="mt-2 gap-3">
            <Button
              titulo="Simular Servicio Terminado"
              cargando={procesando}
              onPress={() => void simularServicioTerminado()}
            />
            {reserva.estado === "Pendiente" && (
              <Button
                titulo="Cancelar reserva"
                variante="peligro"
                cargando={cancelando}
                disabled={procesando || cancelando}
                onPress={cancelarReserva}
              />
            )}
            <Button
              titulo="Reportar incidencia"
              variante="secundario"
              onPress={() =>
                router.push({
                  pathname: "/incidencia",
                  params: { idReserva: String(reservaId) },
                })
              }
            />
            <Button
              titulo="Ir a mis Reservas"
              variante="secundario"
              onPress={() => router.replace("/(app)/(tabs)/reservas")}
            />
          </View>
        )}

        {!puedeSimular && (
          <View className="mt-2 gap-3">
            {reserva.estado === "Finalizado" &&
              (calificacion ? (
                <View className="h-12 w-full flex-row items-center justify-center gap-2 rounded-full border border-yellow-200 bg-yellow-50">
                  <Ionicons name="star" size={18} color="#F59E0B" />
                  <Text className="text-base font-bold text-yellow-700">
                    Calificada ★ {calificacion.puntuacion}/5
                  </Text>
                </View>
              ) : (
                <Button
                  titulo="Calificar servicio"
                  onPress={() =>
                    router.push({
                      pathname: "/calificacion",
                      params: {
                        reservaId: String(reservaId),
                        trabajadorId: String(reserva.idTrabajador),
                      },
                    })
                  }
                />
              ))}
            {(reserva.estado === "Finalizado" || reserva.estado === "Cancelado") && (
              <Button
                titulo="Reportar incidencia"
                variante="secundario"
                onPress={() =>
                  router.push({
                    pathname: "/incidencia",
                    params: { idReserva: String(reservaId) },
                  })
                }
              />
            )}
            <Button
              titulo="Ir a mis Reservas"
              variante="secundario"
              onPress={() => router.replace("/(app)/(tabs)/reservas")}
            />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}