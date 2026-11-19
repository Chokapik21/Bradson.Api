// src/app/(app)/calificacion.tsx
import { ApiError, calificacionesApi, usuariosApi } from "@/api";
import { Button, EstadoVacio, Header, Screen, toast } from "@/components";
import { useAuthStore } from "@/context/authStore";
import { calificacionSchema, type CalificacionFormValues } from "@/utils/validaciones";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

export default function CalificacionScreen() {
  const router = useRouter();
  const rol = useAuthStore((s) => s.usuario?.rol);
  const { reservaId, trabajadorId } = useLocalSearchParams<{ reservaId?: string; trabajadorId?: string }>();
  const [nombreTrabajador, setNombreTrabajador] = useState("tu trabajador");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (trabajadorId) {
      usuariosApi
        .obtener(Number(trabajadorId))
        .then((u) => setNombreTrabajador(u.nombre))
        .catch(() => {});
    }
  }, [trabajadorId]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CalificacionFormValues>({
    resolver: zodResolver(calificacionSchema),
    defaultValues: { puntuacion: 0, comentario: "" },
  });

  const puntuacionActual = watch("puntuacion");

  if (rol === "Trabajador") {
    return (
      <Screen>
        <Header mostrarAtras titulo="Calificación" tituloVerde />
        <View className="flex-1 items-center justify-center px-6">
          <EstadoVacio
            icono="lock-closed-outline"
            titulo="Acción no disponible"
            mensaje="Solo el cliente que recibió el servicio puede calificarlo."
          />
        </View>
      </Screen>
    );
  }

  const onSubmit = async (data: CalificacionFormValues) => {
    if (!reservaId) {
      toast.error("No se encontró la reserva asociada.");
      return;
    }
    setCargando(true);
    try {
      await calificacionesApi.crear({
        puntuacion: data.puntuacion,
        comentario: data.comentario ? data.comentario : null,
        idReserva: Number(reservaId),
      });

      toast.exito("¡Calificación guardada exitosamente!");
      router.dismissAll();
      router.replace("/inicio")
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudo guardar la calificación.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Screen>
      <Header mostrarAtras titulo="Calificacion" tituloVerde />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-10 pt-4 px-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado central */}
        <View className="items-center mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
            ¿Cómo estuvo el servicio?
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            Califica el trabajo de {nombreTrabajador}
          </Text>
        </View>

        {/* Selector de puntuación (Estrellas) */}
        <View className="items-center mb-6">
          <View className="flex-row gap-3">
            {[1, 2, 3, 4, 5].map((estrella) => (
              <Pressable
                key={estrella}
                onPress={() => setValue("puntuacion", estrella, { shouldValidate: true })}
                className="p-2 active:opacity-70"
              >
                <Ionicons
                  name={estrella <= puntuacionActual ? "star" : "star-outline"}
                  size={36}
                  color={estrella <= puntuacionActual ? "#F59E0B" : "#D1D5DB"}
                />
              </Pressable>
            ))}
          </View>
          {errors.puntuacion && (
            <Text className="mt-2 text-xs text-red-600">{errors.puntuacion.message}</Text>
          )}
        </View>

        {/* Comentario */}
        <View className="mb-6">
          <Controller
            control={control}
            name="comentario"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Deja un comentario sobre tu experiencia (opcional)..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                maxLength={500}
                textAlignVertical="top"
                className="w-full min-h-[120px] rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-base text-gray-900"
              />
            )}
          />
          {errors.comentario && (
            <Text className="mt-1 px-2 text-xs text-red-600">{errors.comentario.message}</Text>
          )}
        </View>

        {/* Enlace incidencia */}
        <Pressable
          onPress={() => {
            if (reservaId) {
              router.push({
                pathname: "/incidencia",
                params: { idReserva: String(reservaId) },
              });
            } else {
              toast.error("No se encontró la reserva asociada.");
            }
          }}
          className="flex-row items-center gap-2 mb-8 self-center active:opacity-70"
        >
          <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
          <Text className="text-red-600 font-semibold text-sm">
            Reportar una incidencia o novedad
          </Text>
        </Pressable>

        {/* Botón enviar */}
        <View className="pb-4">
          <Button
            titulo="Enviar Calificacion"
            cargando={cargando}
            onPress={() => void handleSubmit(onSubmit)()}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
