// src/app/(app)/reserva/[id].tsx
import { ApiError, calificacionesApi, pagosApi, reservasApi } from "@/api";
import { AppModal, Button, Card, EstadoVacio, Header, Screen, SkeletonCard, toast } from "@/components";
import { useAuthStore } from "@/context/authStore";
import { useReservaStore } from "@/context/reservaStore";
import { useReserva } from "@/hooks/useReserva";
import type { CalificacionDto, EstadoReserva } from "@/types";
import { formatearFechaHoraApi } from "@/utils/fechas";
import { formatMoneda } from "@/utils/moneda";
import { COLOR_BRAND } from "@/utils/theme";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { urlArchivo } from "@/utils/archivo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, type ComponentProps } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconoNombre = ComponentProps<typeof Ionicons>["name"];

interface ResumenEstado {
  icono: IconoNombre;
  color: string;
  fondo: string;
  titulo: string;
  mensaje: string;
}

const RESUMEN_CLIENTE: Record<EstadoReserva, ResumenEstado> = {
  Pendiente: {
    icono: "checkmark",
    color: COLOR_BRAND,
    fondo: "bg-brand-light",
    titulo: "¡Reserva confirmada!",
    mensaje: "Tu trabajador ha sido asignado y llegará en la fecha y hora acordada.",
  },
  EnCurso: {
    icono: "construct-outline",
    color: "#2563EB",
    fondo: "bg-blue-50",
    titulo: "Servicio en curso",
    mensaje: "Tu trabajador está atendiendo el servicio en este momento.",
  },
  Finalizado: {
    icono: "checkmark-done",
    color: COLOR_BRAND,
    fondo: "bg-brand-light",
    titulo: "Reserva finalizada",
    mensaje: "Tu servicio ha concluido. ¡Gracias por confiar en Bradson!",
  },
  Cancelado: {
    icono: "close",
    color: "#DC2626",
    fondo: "bg-red-50",
    titulo: "Reserva cancelada",
    mensaje: "Esta reserva fue cancelada. Puedes agendar un nuevo servicio cuando quieras.",
  },
};

const RESUMEN_TRABAJADOR: Record<EstadoReserva, ResumenEstado> = {
  Pendiente: {
    icono: "checkmark",
    color: COLOR_BRAND,
    fondo: "bg-brand-light",
    titulo: "Servicio asignado",
    mensaje: "Tienes un servicio programado con este cliente. Revisa la fecha y hora.",
  },
  EnCurso: {
    icono: "construct-outline",
    color: "#2563EB",
    fondo: "bg-blue-50",
    titulo: "Servicio en curso",
    mensaje: "Estás atendiendo este servicio. Recuerda finalizarlo al terminar.",
  },
  Finalizado: {
    icono: "checkmark-done",
    color: COLOR_BRAND,
    fondo: "bg-brand-light",
    titulo: "Servicio finalizado",
    mensaje: "Has completado este servicio. Revisa la calificación que dejó el cliente.",
  },
  Cancelado: {
    icono: "close",
    color: "#DC2626",
    fondo: "bg-red-50",
    titulo: "Servicio cancelado",
    mensaje: "Este servicio fue cancelado por el cliente.",
  },
};

const PASOS_ESTADO: { estado: EstadoReserva; titulo: string; descripcion: string }[] = [
  {
    estado: "Pendiente",
    titulo: "Reserva confirmada",
    descripcion: "El servicio quedó agendado.",
  },
  {
    estado: "EnCurso",
    titulo: "Servicio en curso",
    descripcion: "El trabajador está atendiendo el servicio.",
  },
  {
    estado: "Finalizado",
    titulo: "Servicio finalizado",
    descripcion: "El trabajo se completó correctamente.",
  },
];

function LineaTiempo({
  estado,
  fecha,
  hora,
}: {
  estado: EstadoReserva;
  fecha: string;
  hora: string;
}) {
  const actual = PASOS_ESTADO.findIndex((paso) => paso.estado === estado);

  return (
    <Card className="mb-6 p-4">
      <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
        Seguimiento
      </Text>

      {PASOS_ESTADO.map((paso, indice) => {
        const hecho = indice < actual;
        const esActual = indice === actual;
        const esUltimo = indice === PASOS_ESTADO.length - 1;

        return (
          <View key={paso.estado} className="flex-row">
            <View className="mr-3 items-center">
              <View
                className={`h-7 w-7 items-center justify-center rounded-full ${
                  hecho
                    ? "bg-brand"
                    : esActual
                      ? "border-2 border-brand bg-white"
                      : "border border-gray-300 bg-white"
                }`}
              >
                {hecho ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : esActual ? (
                  <View className="h-2.5 w-2.5 rounded-full bg-brand" />
                ) : null}
              </View>
              {!esUltimo ? (
                <View className={`my-1 w-0.5 flex-1 ${hecho ? "bg-brand" : "bg-gray-200"}`} />
              ) : null}
            </View>

            <View className={`flex-1 ${esUltimo ? "" : "pb-5"}`}>
              <Text
                className={`text-sm font-bold ${
                  esActual ? "text-brand-dark" : hecho ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {paso.titulo}
              </Text>
              <Text className="mt-0.5 text-xs text-gray-500">{paso.descripcion}</Text>
              {paso.estado === "Pendiente" ? (
                <Text className="mt-1 text-xs font-semibold text-brand">
                  {formatearFechaHoraApi(fecha, hora)}
                </Text>
              ) : null}
              {esActual ? (
                <Text className="mt-1 text-[11px] font-bold uppercase tracking-wide text-brand">
                  Estado actual
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </Card>
  );
}

export default function DetalleReserva() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reservaId = Number(id);
  const router = useRouter();
  const rol = useAuthStore((s) => s.usuario?.rol);
  const esTrabajador = rol === "Trabajador";

  const { reserva, pago, cargando, setReserva, setPago } = useReserva(reservaId);
  const [procesando, setProcesando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [calificacion, setCalificacion] = useState<CalificacionDto | null>(null);
  const [calificaciones, setCalificaciones] = useState<CalificacionDto[]>([]);
  const [verCalificacion, setVerCalificacion] = useState(false);
  const metodo = useReservaStore((s) => s.metodosPago[reservaId]) ?? "Tarjeta";
  const insets = useSafeAreaInsets();

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
        setCalificaciones(lista);
        setCalificacion(lista.find((c) => c.idReserva === reservaId) ?? null);
      })
      .catch(() => {
        if (activo) {
          setCalificaciones([]);
          setCalificacion(null);
        }
      });
    return () => {
      activo = false;
    };
  }, [reserva?.estado, reservaId]);

  if (cargando) {
    return (
      <Screen>
        <Header mostrarAtras titulo={esTrabajador ? "Servicio asignado" : "Mi reserva"} tituloVerde />
        <View className="gap-3 pt-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </Screen>
    );
  }

  if (!reserva) {
    return (
      <Screen>
        <Header mostrarAtras titulo={esTrabajador ? "Servicio asignado" : "Mi reserva"} tituloVerde />
        <EstadoVacio
          icono="calendar-outline"
          titulo="Reserva no encontrada"
          mensaje="No pudimos cargar esta reserva. Vuelve atrás e inténtalo de nuevo."
        />
        <Button titulo="Volver" variante="secundario" onPress={() => router.back()} />
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
      toast.exito(
        esTrabajador ? "Servicio finalizado correctamente." : "Servicio finalizado y pago procesado",
      );
      if (!esTrabajador) {
        router.push({
          pathname: "/calificacion",
          params: { reservaId: String(reservaId), trabajadorId: String(reserva.idTrabajador) },
        });
      }
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

  const confirmarCambioTrabajador = (nuevoEstado: "EnCurso" | "Finalizado"): void => {
    const accion = nuevoEstado === "EnCurso" ? "iniciar" : "finalizar";
    Alert.alert(
      `¿${nuevoEstado === "EnCurso" ? "Iniciar" : "Finalizar"} servicio?`,
      `¿Confirmas que deseas ${accion} este servicio?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "default",
          onPress: async () => {
            setProcesando(true);
            try {
              await reservasApi.cambiarEstado(reservaId, { estado: nuevoEstado });
              setReserva({ ...reserva, estado: nuevoEstado });

              if (nuevoEstado === "Finalizado") {
                const pagoActual = await pagosApi.obtenerPorReserva(reservaId);
                const pagoProcesado =
                  pagoActual.estadoPago === "Pendiente"
                    ? await pagosApi.procesar(pagoActual.id, { metodoPago: metodo }, true)
                    : pagoActual;
                setPago(pagoProcesado);
              }

              toast.exito(
                nuevoEstado === "EnCurso" ? "Servicio iniciado." : "Servicio finalizado.",
              );
            } catch (e) {
              toast.error(
                e instanceof ApiError ? e.message : "No se pudo cambiar el estado del servicio.",
              );
            } finally {
              setProcesando(false);
            }
          },
        },
      ],
    );
  };

  const irACalificar = (): void => {
    router.push({
      pathname: "/calificacion",
      params: {
        reservaId: String(reservaId),
        trabajadorId: String(reserva.idTrabajador),
      },
    });
  };

  const irAIncidencia = (): void => {
    router.push({
      pathname: "/incidencia",
      params: { idReserva: String(reservaId) },
    });
  };

  const nombreTrabajador = reserva?.nombreTrabajador || "Trabajador asignado";
  const nombreCliente = reserva?.nombreCliente || "Cliente";
  const telefonoTrabajador = reserva?.telefonoTrabajador;
  const telefonoCliente = reserva?.telefonoCliente;
  const resumen = (esTrabajador ? RESUMEN_TRABAJADOR : RESUMEN_CLIENTE)[reserva.estado];
  const promedioCalificaciones =
    calificaciones.length > 0
      ? calificaciones.reduce((total, c) => total + c.puntuacion, 0) / calificaciones.length
      : null;
  const puntuacionOponente = calificacion?.puntuacion ?? promedioCalificaciones;

  return (
    <Screen>
      <Header
        mostrarAtras
        titulo={esTrabajador ? "Servicio asignado" : "Mi reserva"}
        tituloVerde
        derecha={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ir a mis reservas"
            onPress={() => router.replace("/(app)/(tabs)/reservas")}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-gray-100"
          >
            <Ionicons name="calendar-outline" size={26} color="#1F2937" />
          </Pressable>
        }
      />

      <ScrollView className="flex-1" contentContainerClassName="pb-8 pt-4" showsVerticalScrollIndicator={false}>
        {/* Estado de la reserva */}
        <View className="items-center mb-6">
          <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${resumen.fondo}`}>
            <Ionicons name={resumen.icono} size={32} color={resumen.color} />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-1 text-center">
            {resumen.titulo}
          </Text>
          <Text className="text-sm text-gray-500 text-center px-4">
            {resumen.mensaje}
          </Text>
        </View>

        {/* Seguimiento del estado */}
        {reserva.estado !== "Cancelado" ? (
          <LineaTiempo estado={reserva.estado} fecha={reserva.fecha} hora={reserva.hora} />
        ) : null}

        {/* Tarjeta de la contraparte */}
        <Card className="p-4 mb-6">
          <View className={`flex-row items-center justify-between ${esTrabajador ? "" : "mb-4"}`}>
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
                {esTrabajador ? (
                  reserva.fotoCliente ? (
                    <Image source={{ uri: urlArchivo(reserva.fotoCliente) ?? undefined }} style={{ width: 48, height: 48 }} contentFit="cover" transition={200} />
                  ) : (
                    <Ionicons name="person" size={24} color="#6B7280" />
                  )
                ) : (
                  reserva.fotoTrabajador ? (
                    <Image source={{ uri: urlArchivo(reserva.fotoTrabajador) ?? undefined }} style={{ width: 48, height: 48 }} contentFit="cover" transition={200} />
                  ) : (
                    <Ionicons name="person" size={24} color="#6B7280" />
                  )
                )}
              </View>
              <View>
                <Text className="text-base font-bold text-gray-900">
                  {esTrabajador ? nombreCliente : nombreTrabajador}
                </Text>
                <Text className="text-xs text-gray-500">
                  {esTrabajador ? "Cliente" : "Trabajador asignado"}
                </Text>
                {esTrabajador &&
                  (telefonoCliente ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Llamar al cliente ${nombreCliente}`}
                      onPress={() => void Linking.openURL(`tel:${telefonoCliente}`)}
                      className="mt-1 flex-row items-center gap-1 active:opacity-70"
                    >
                      <Ionicons name="call-outline" size={14} color={COLOR_BRAND} />
                      <Text className="text-sm font-semibold text-brand">{telefonoCliente}</Text>
                    </Pressable>
                  ) : (
                    <Text className="mt-1 text-xs text-gray-400">Teléfono no disponible</Text>
                  ))}
              </View>
            </View>
            {!esTrabajador && (
              <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-full">
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text className="text-xs font-bold text-yellow-700 ml-1">
                  {puntuacionOponente !== null ? puntuacionOponente.toFixed(1) : "—"}
                </Text>
              </View>
            )}
          </View>

          {!esTrabajador && (
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
          )}
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
            Fecha: {formatearFechaHoraApi(reserva.fecha, reserva.hora)}
          </Text>
          <Text className="text-sm text-gray-700">Dirección: {reserva.direccion}</Text>
          <Text className="text-sm font-bold text-gray-900 mt-2">
            {reserva.estado === "Finalizado" ? "Total pagado" : "Total"}: {formatMoneda(reserva.precioTotal)}
          </Text>
          {pago && (
            <Text
              className={`text-xs font-bold mt-1 ${pago.estadoPago === "Fallido" ? "text-red-600" : "text-brand"
                }`}
            >
              Pago: {pago.estadoPago} ({pago.metodoPago})
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={irAIncidencia}
            className="mt-3 flex-row items-center gap-1.5 self-start active:opacity-70"
          >
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text className="text-sm font-semibold text-red-600">Reportar incidencia</Text>
          </Pressable>
        </Card>

      </ScrollView>

      <View
        className="border-t border-gray-100 bg-white pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        {esTrabajador ? (
          <>
            {reserva.estado === "Pendiente" ? (
              <Button
                titulo="Iniciar servicio"
                cargando={procesando}
                onPress={() => confirmarCambioTrabajador("EnCurso")}
              />
            ) : reserva.estado === "EnCurso" ? (
              <Button
                titulo="Finalizar servicio"
                cargando={procesando}
                onPress={() => confirmarCambioTrabajador("Finalizado")}
              />
            ) : reserva.estado === "Finalizado" ? (
              <Button
                titulo="Ver calificación del servicio"
                variante="secundario"
                onPress={() => setVerCalificacion(true)}
              />
            ) : null}
          </>
        ) : reserva.estado === "Finalizado" ? (
          calificacion ? (
            <View className="h-12 w-full flex-row items-center justify-center gap-2 rounded-full border border-yellow-200 bg-yellow-50">
              <Ionicons name="star" size={18} color="#F59E0B" />
              <Text className="text-base font-bold text-yellow-700">
                Calificada ★ {calificacion.puntuacion}/5
              </Text>
            </View>
          ) : (
            <Button titulo="Calificar servicio" onPress={irACalificar} />
          )
        ) : reserva.estado === "Cancelado" ? (
          <Button
            titulo="Solicitar otro servicio"
            variante="secundario"
            onPress={() => router.replace("/(app)/(tabs)/inicio")}
          />
        ) : (
          <>
            <Button
              titulo="Simular Servicio Terminado"
              cargando={procesando}
              onPress={() => void simularServicioTerminado()}
            />
            {reserva.estado === "Pendiente" ? (
              <Pressable
                onPress={cancelarReserva}
                disabled={procesando || cancelando}
                className="mt-1 h-10 items-center justify-center active:opacity-70"
              >
                <Text className="text-sm font-semibold text-red-600">
                  {cancelando ? "Cancelando..." : "Cancelar reserva"}
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </View>

      <AppModal
        visible={verCalificacion}
        titulo="Calificación del cliente"
        onClose={() => setVerCalificacion(false)}
      >
        {calificacion ? (
          <View className="gap-3">
            <View className="flex-row items-center gap-1">
              {[1, 2, 3, 4, 5].map((estrella) => (
                <Ionicons
                  key={estrella}
                  name={estrella <= calificacion.puntuacion ? "star" : "star-outline"}
                  size={24}
                  color="#F59E0B"
                />
              ))}
              <Text className="ml-1 text-sm font-bold text-gray-900">
                {calificacion.puntuacion}/5
              </Text>
            </View>
            <Text className="text-sm text-gray-700">
              {calificacion.comentario
                ? `“${calificacion.comentario}”`
                : "El cliente no dejó comentario."}
            </Text>
          </View>
        ) : (
          <Text className="text-sm text-gray-600">
            El cliente aún no ha calificado este servicio.
          </Text>
        )}

        <View className="mt-4">
          <Button
            titulo="Cerrar"
            variante="secundario"
            onPress={() => setVerCalificacion(false)}
          />
        </View>
      </AppModal>
    </Screen>
  );
}