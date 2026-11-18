// src/app/(app)/pago.tsx
import { ApiError, reservasApi } from "@/api";
import { Button, Card, EstadoVacio, Header, Screen, toast } from "@/components";
import { useReservaStore } from "@/context/reservaStore";
import { formatearFechaApi } from "@/utils/fechas";
import { formatMoneda } from "@/utils/moneda";
import { COLOR_BRAND } from "@/utils/theme"; 
import { pagoSchema, type PagoFormValues } from "@/utils/validaciones";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

export default function Pago() {
  const router = useRouter();
  const borrador = useReservaStore((s) => s.borrador);
  const limpiar = useReservaStore((s) => s.limpiar);
  const guardarMetodoPago = useReservaStore((s) => s.guardarMetodoPago);

  const [cargando, setCargando] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: { metodoPago: "Tarjeta" },
  });

  if (borrador === null) {
    return (
      <Screen>
        <Header mostrarAtras titulo="Pago" tituloVerde />
        <EstadoVacio
          icono="receipt-outline"
          titulo="No hay una reserva en curso"
          mensaje="Vuelve al inicio y elige un servicio."
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
      toast.exito(`Reserva #${reserva.id} creada`);
      router.replace({ pathname: "/reserva/[id]", params: { id: String(reserva.id) } });
      limpiar();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudo crear la reserva.");
      setCargando(false);
    }
  };

  return (
    <Screen>
      <Header mostrarAtras titulo="Pago" tituloVerde />

      {/* Resumen del Servicio con datos del trabajador */}
      <Card className="mt-4 gap-2 p-4">
        <Text className="text-xs font-bold tracking-wider text-gray-500 uppercase">
          RESUMEN DEL SERVICIO
        </Text>

        <Text className="text-lg font-bold text-gray-900">
          {borrador.servicio.nombreCategoria}
        </Text>

        <View className="flex-row items-center gap-1.5">
          <Ionicons name="calendar-outline" size={15} color="#6B7280" />
          <Text className="text-sm text-gray-600">
            {`${formatearFechaApi(borrador.fecha)} a las ${borrador.hora.slice(0, 5)}`}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <Ionicons name="location-outline" size={15} color="#6B7280" />
          <Text className="text-sm text-gray-600">
            {borrador.direccion}
          </Text>
        </View>

        <View className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Ionicons name="person-circle-outline" size={24} color={COLOR_BRAND} />
            <View>
              <Text className="text-sm font-semibold text-gray-800">
                {borrador.trabajador.nombre}
              </Text>
              <Text className="text-xs text-gray-500">Trabajador asignado</Text>
            </View>
          </View>
          <View className="bg-brand-light px-2 py-1 rounded-full">
            <Text className="text-xs font-bold text-brand-dark">
              {borrador.trabajador.distanciaKm.toFixed(1)} km
            </Text>
          </View>
        </View>

        <View className="h-[1px] bg-gray-200 my-2" />

        <View className="flex-row justify-between items-center">
          <Text className="text-base font-bold text-gray-900">Total a Pagar</Text>
          <Text className="text-xl font-bold text-brand">
            {formatMoneda(borrador.servicio.tarifaBase)}
          </Text>
        </View>
      </Card>

      {/* Sección: Método de pago */}
      <View className="mt-6">
        <Text className="text-base font-bold text-gray-900 mb-3">
          Método de pago
        </Text>

        <Controller
          control={control}
          name="metodoPago"
          render={({ field: { value, onChange } }) => (
            <View className="gap-3">
              <Pressable
                onPress={() => onChange("Tarjeta")}
                className={`flex-row items-center p-4 rounded-xl border ${value === "Tarjeta"
                    ? "border-brand bg-brand-light/30"
                    : "border-gray-200 bg-white"
                  }`}
              >
                <View className="w-10 h-10 rounded-full bg-brand-light items-center justify-center mr-3">
                  <Ionicons name="card-outline" size={20} color={COLOR_BRAND} />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 text-base">
                    Tarjeta de Crédito / Débito
                  </Text>
                  <Text className="text-xs text-gray-500">Pago seguro con pasarela</Text>
                </View>
                <Ionicons
                  name={value === "Tarjeta" ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={value === "Tarjeta" ? COLOR_BRAND : "#9CA3AF"}
                />
              </Pressable>

              <Pressable
                onPress={() => onChange("Efectivo")}
                className={`flex-row items-center p-4 rounded-xl border ${value === "Efectivo"
                    ? "border-brand bg-brand-light/30"
                    : "border-gray-200 bg-white"
                  }`}
              >
                <View className="w-10 h-10 rounded-full bg-brand-light items-center justify-center mr-3">
                  <Ionicons name="cash-outline" size={20} color={COLOR_BRAND} />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 text-base">
                    Efectivo al finalizar
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Pagas directamente al trabajador
                  </Text>
                </View>
                <Ionicons
                  name={value === "Efectivo" ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={value === "Efectivo" ? COLOR_BRAND : "#9CA3AF"}
                />
              </Pressable>
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
    </Screen>
  );
}