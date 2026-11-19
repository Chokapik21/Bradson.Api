// src/app/(app)/pago.tsx
import { ApiError, reservasApi } from "@/api";
import { Button, Card, EstadoVacio, Header, Screen, toast } from "@/components";
import { useReservaStore } from "@/context/reservaStore";
import { formatearFechaHoraApi } from "@/utils/fechas";
import { formatMoneda } from "@/utils/moneda";
import { COLOR_BRAND } from "@/utils/theme";
import { Image } from "expo-image";
import { urlArchivo } from "@/utils/archivo";
import { pagoSchema, type PagoFormValues } from "@/utils/validaciones";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState, type ComponentProps } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, View } from "react-native";

function OpcionPago({
  icono,
  titulo,
  subtitulo,
  seleccionado,
  onPress,
}: {
  icono: ComponentProps<typeof Ionicons>["name"];
  titulo: string;
  subtitulo: string;
  seleccionado: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: seleccionado }}
      onPress={onPress}
      className={`flex-row items-center rounded-xl border p-4 active:opacity-80 ${
        seleccionado ? "border-brand bg-brand-light/30" : "border-gray-200 bg-white"
      }`}
    >
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-brand-light">
        <Ionicons name={icono} size={20} color={COLOR_BRAND} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900">{titulo}</Text>
        <Text className="text-xs text-gray-500">{subtitulo}</Text>
      </View>
      <Ionicons
        name={seleccionado ? "radio-button-on" : "radio-button-off"}
        size={20}
        color={seleccionado ? COLOR_BRAND : "#9CA3AF"}
      />
    </Pressable>
  );
}

export default function Pago() {
  const router = useRouter();
  const borrador = useReservaStore((s) => s.borrador);
  const limpiar = useReservaStore((s) => s.limpiar);
  const guardarMetodoPago = useReservaStore((s) => s.guardarMetodoPago);

  const [cargando, setCargando] = useState(false);
  const [reservaCreadaId, setReservaCreadaId] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: { metodoPago: "Tarjeta" },
  });

  if (reservaCreadaId !== null) {
    const verReserva = (): void => {
      limpiar();
      router.replace({
        pathname: "/reserva/[id]",
        params: { id: String(reservaCreadaId) },
      });
    };

    const volverAlInicio = (): void => {
      limpiar();
      router.replace("/(app)/(tabs)/inicio");
    };

    return (
      <Screen>
        <Header titulo="Pago" tituloVerde />
        <View className="flex-1 items-center justify-center px-2">
          <View className="mb-5 h-24 w-24 items-center justify-center rounded-full bg-brand-light">
            <Ionicons name="checkmark" size={52} color={COLOR_BRAND} />
          </View>
          <Text className="text-center text-2xl font-bold text-gray-900">
            ¡Reserva confirmada!
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-500">
            Tu servicio quedó agendado. Te avisaremos cuando el trabajador esté en camino.
          </Text>

          <View className="mt-8 w-full gap-3">
            <Button titulo="Ver mi reserva" onPress={verReserva} />
            <Button
              titulo="Volver al inicio"
              variante="secundario"
              onPress={volverAlInicio}
            />
          </View>
        </View>
      </Screen>
    );
  }

  if (borrador === null) {
    return (
      <Screen>
        <Header mostrarAtras titulo="Pago" tituloVerde />
        <EstadoVacio
          icono="receipt-outline"
          titulo="No hay una reserva en curso"
          mensaje="Vuelve al inicio y elige un servicio."
        />
        <Button
          titulo="Explorar servicios"
          variante="secundario"
          onPress={() => router.replace("/(app)/(tabs)/inicio")}
        />
      </Screen>
    );
  }

  const onSubmit = async (data: PagoFormValues) => {
    setCargando(true);
    try {
      const reserva = await reservasApi.crear({
        fecha: borrador.fecha,
        hora: borrador.hora,
        latitud: borrador.latitud,
        longitud: borrador.longitud,
        direccion: borrador.direccion,
        referencia: borrador.referencia,
        idTrabajador: borrador.trabajador.idTrabajador,
        idServicio: borrador.servicio.id,
      });

      guardarMetodoPago(reserva.id, data.metodoPago);
      setReservaCreadaId(reserva.id);
      setCargando(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudo crear la reserva.");
      setCargando(false);
    }
  };

  return (
    <Screen>
      <Header mostrarAtras titulo="Pago" tituloVerde />

      <ScrollView
        className="flex-1"
        contentContainerClassName="py-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Resumen del Servicio con datos del trabajador */}
        <Card className="gap-2 p-4">
          <Text className="text-xs font-bold uppercase tracking-wider text-gray-500">
            RESUMEN DEL SERVICIO
          </Text>

          <Text className="text-lg font-bold text-gray-900">
            {borrador.servicio.nombreCategoria}
          </Text>

          <View className="flex-row items-center gap-1.5">
            <Ionicons name="calendar-outline" size={15} color="#6B7280" />
            <Text className="text-sm text-gray-600">
              {formatearFechaHoraApi(borrador.fecha, borrador.hora)}
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5">
            <Ionicons name="location-outline" size={15} color="#6B7280" />
            <Text className="text-sm text-gray-600">{borrador.direccion}</Text>
          </View>

          <View className="mt-2 flex-row items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3">
            <View className="flex-row items-center gap-2">
              {borrador.trabajador.fotoPerfil ? (
                <Image source={{ uri: urlArchivo(borrador.trabajador.fotoPerfil) ?? undefined }} style={{ width: 34, height: 34 }} contentFit="cover" transition={200} />
              ) : (
                <Ionicons name="person-circle-outline" size={24} color={COLOR_BRAND} />
              )}
              <View>
                <Text className="text-sm font-semibold text-gray-800">
                  {borrador.trabajador.nombre}
                </Text>
                <Text className="text-xs text-gray-500">Trabajador asignado</Text>
              </View>
            </View>
            <View className="rounded-full bg-brand-light px-2 py-1">
              <Text className="text-xs font-bold text-brand-dark">
                {borrador.trabajador.distanciaKm.toFixed(1)} km
              </Text>
            </View>
          </View>

          <View className="mt-3 gap-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Tarifa del servicio</Text>
              <Text className="text-sm text-gray-700">
                {formatMoneda(borrador.servicio.tarifaBase)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Cargos adicionales</Text>
              <Text className="text-sm text-gray-700">$0</Text>
            </View>
          </View>

          <View className="my-2 h-[1px] bg-gray-200" />

          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-gray-900">Total a Pagar</Text>
            <Text className="text-xl font-bold text-brand">
              {formatMoneda(borrador.servicio.tarifaBase)}
            </Text>
          </View>
        </Card>

        {/* Sección: Método de pago */}
        <View className="mt-6">
          <Text className="mb-3 text-base font-bold text-gray-900">Método de pago</Text>

          <Controller
            control={control}
            name="metodoPago"
            render={({ field: { value, onChange } }) => (
              <View className="gap-3">
                <OpcionPago
                  icono="card-outline"
                  titulo="Tarjeta de Crédito / Débito"
                  subtitulo="Pago seguro con pasarela"
                  seleccionado={value === "Tarjeta"}
                  onPress={() => onChange("Tarjeta")}
                />
                <OpcionPago
                  icono="business-outline"
                  titulo="PSE"
                  subtitulo="Débito desde tu banco"
                  seleccionado={value === "PSE"}
                  onPress={() => onChange("PSE")}
                />
                <OpcionPago
                  icono="cash-outline"
                  titulo="Efectivo al finalizar"
                  subtitulo="Pagas directamente al trabajador"
                  seleccionado={value === "Efectivo"}
                  onPress={() => onChange("Efectivo")}
                />
              </View>
            )}
          />
          {errors.metodoPago && (
            <Text className="mt-1 px-2 text-xs text-red-600">
              {errors.metodoPago.message}
            </Text>
          )}
        </View>

        {/* Acción y pie */}
        <View className="mt-8 gap-4">
          <Button
            titulo="Pagar y Reservar"
            cargando={cargando}
            onPress={() => void handleSubmit(onSubmit)()}
          />

          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="shield-checkmark-outline" size={16} color="#6B7280" />
            <Text className="text-xs text-gray-500">Pago seguro y encriptado</Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
