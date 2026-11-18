// src/app/(app)/incidencia.tsx
import { ApiError, incidenciasApi } from "@/api";
import { Button, Card, EstadoVacio, Header, Screen, SkeletonCard, toast } from "@/components";
import type { IncidenciaCreateDto, IncidenciaDto } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { z } from "zod";

// ─── Tipos de novedad disponibles ───────────────────────────────────────────
const TIPOS_NOVEDAD = [
  "Retraso o ausencia",
  "Daño material",
  "Calidad del servicio",
  "Diferencia en el cobro",
  "Seguridad o trato",
  "Otro",
] as const;

// ─── Schema Zod ─────────────────────────────────────────────────────────────
const schema = z.object({
  tipoNovedad: z.string().min(1, "Selecciona el tipo de novedad."),
  descripcion: z
    .string()
    .trim()
    .min(10, "Describe lo ocurrido con al menos 10 caracteres.")
    .max(500, "Máximo 500 caracteres."),
});

type FormValues = z.infer<typeof schema>;

// ─── Chip de selección rápida ────────────────────────────────────────────────
function ChipTipo({
  label,
  seleccionado,
  onPress,
}: {
  label: string;
  seleccionado: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 mb-2 px-4 py-2 rounded-full border ${seleccionado
          ? "bg-brand border-brand"
          : "bg-white border-gray-300"
        } active:opacity-70`}
    >
      <Text
        className={`text-sm font-medium ${seleccionado ? "text-white" : "text-gray-700"
          }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Tarjeta de incidencia reportada ────────────────────────────────────────
function IncidenciaItem({ item }: { item: IncidenciaDto }) {
  const colorEstado: Record<string, string> = {
    Abierta: "text-yellow-700 bg-yellow-50",
    EnProceso: "text-blue-700 bg-blue-50",
    Resuelta: "text-brand bg-brand-light",
    Cerrada: "text-gray-500 bg-gray-100",
  };
  const cls = colorEstado[item.estadoSolucion] ?? "text-gray-500 bg-gray-100";

  return (
    <Card className="p-4 mb-3 gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-gray-900">{item.tipoNovedad}</Text>
        <View className={`px-2 py-0.5 rounded-full ${cls.split(" ")[1]}`}>
          <Text className={`text-xs font-semibold ${cls.split(" ")[0]}`}>
            {item.estadoSolucion}
          </Text>
        </View>
      </View>
      <Text className="text-sm text-gray-600">{item.descripcion}</Text>
    </Card>
  );
}

// ─── Pantalla principal ──────────────────────────────────────────────────────
export default function Incidencia() {
  const { idReserva } = useLocalSearchParams<{ idReserva?: string }>();
  const router = useRouter();

  const reservaId = Number(idReserva);
  const idValido = Number.isInteger(reservaId) && reservaId > 0;

  const [enviando, setEnviando] = useState(false);
  const [historial, setHistorial] = useState<IncidenciaDto[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipoNovedad: "", descripcion: "" },
  });

  const tipoSeleccionado = watch("tipoNovedad");
  const descripcionActual = watch("descripcion");

  // Cargar historial de incidencias de esta reserva
  const cargarHistorial = (): void => {
    if (!idValido) return;
    setCargandoHistorial(true);
    setErrorHistorial(null);
    incidenciasApi
      .listarPorReserva(reservaId)
      .then(setHistorial)
      .catch((e: unknown) => {
        // 404 significa "sin incidencias aún" — no es error real
        if (e instanceof ApiError && e.status === 404) {
          setHistorial([]);
        } else {
          setErrorHistorial(
            e instanceof ApiError ? e.message : "Error al cargar el historial."
          );
        }
      })
      .finally(() => setCargandoHistorial(false));
  };

  useEffect(() => {
    cargarHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservaId]);

  const onSubmit = async (values: FormValues): Promise<void> => {
    if (enviando) return;
    setEnviando(true);
    try {
      const payload: IncidenciaCreateDto = {
        idReserva: reservaId,
        tipoNovedad: values.tipoNovedad,
        descripcion: values.descripcion.trim(),
      };
      await incidenciasApi.crear(payload);
      toast.exito("Incidencia reportada correctamente.");
      // Refrescar historial con la nueva incidencia
      cargarHistorial();
      // Limpiar formulario
      setValue("tipoNovedad", "");
      setValue("descripcion", "");
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "No se pudo registrar la incidencia."
      );
    } finally {
      setEnviando(false);
    }
  };

  // idReserva inválido → estado vacío con botón de regreso
  if (!idValido) {
    return (
      <Screen>
        <Header mostrarAtras titulo="Reportar Incidencia" />
        <EstadoVacio
          icono="alert-circle-outline"
          titulo="Reserva no encontrada"
          mensaje="No se pudo identificar la reserva. Vuelve atrás e inténtalo de nuevo."
        />
        <View className="px-4 mt-4">
          <Button titulo="Volver" variante="secundario" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header mostrarAtras titulo="Reportar Incidencia" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-10 px-4 pt-2"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Formulario ─────────────────────────────────────────────────── */}
        <Card className="p-4 mb-6 gap-4">
          <View>
            <Text className="text-base font-bold text-gray-900">
              Reporte de Novedad
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              Describe lo ocurrido con tu servicio para gestionarlo oportunamente.
            </Text>
          </View>

          {/* Tipo de novedad */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Tipo de novedad
            </Text>
            <View className="flex-row flex-wrap">
              {TIPOS_NOVEDAD.map((tipo) => (
                <ChipTipo
                  key={tipo}
                  label={tipo}
                  seleccionado={tipoSeleccionado === tipo}
                  onPress={() => setValue("tipoNovedad", tipo, { shouldValidate: true })}
                />
              ))}
            </View>
            {errors.tipoNovedad ? (
              <Text className="mt-1 text-xs text-red-600">
                {errors.tipoNovedad.message}
              </Text>
            ) : null}
          </View>

          {/* Descripción */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-1">
              Descripción
            </Text>
            <Controller
              control={control}
              name="descripcion"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Describe con detalle lo que ocurrió…"
                  multiline
                  numberOfLines={5}
                  maxLength={500}
                  textAlignVertical="top"
                  className={`border rounded-xl px-3 py-3 text-sm text-gray-800 bg-gray-50 min-h-[120px] ${errors.descripcion ? "border-red-500" : "border-gray-300"
                    }`}
                />
              )}
            />
            <View className="flex-row justify-between mt-1 px-1">
              {errors.descripcion ? (
                <Text className="text-xs text-red-600">
                  {errors.descripcion.message}
                </Text>
              ) : (
                <Text />
              )}
              <Text className="text-xs text-gray-400">
                {descripcionActual.length}/500
              </Text>
            </View>
          </View>

          <Button
            titulo="Enviar reporte"
            cargando={enviando}
            disabled={enviando}
            onPress={() => void handleSubmit(onSubmit)()}
          />
        </Card>

        {/* Historial de incidencias ───────────────────────────────────── */}
        <Text className="text-base font-bold text-gray-900 mb-3">
          Historial de incidencias
        </Text>

        {cargandoHistorial ? (
          <View className="gap-3">
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : errorHistorial !== null ? (
          <View>
            <EstadoVacio
              icono="cloud-offline-outline"
              titulo="Error al cargar"
              mensaje={errorHistorial}
            />
            <Button
              titulo="Reintentar"
              variante="secundario"
              onPress={cargarHistorial}
            />
          </View>
        ) : historial.length === 0 ? (
          <EstadoVacio
            icono="document-text-outline"
            titulo="Sin incidencias registradas"
            mensaje="Aún no hay incidencias reportadas para esta reserva."
          />
        ) : (
          historial.map((item) => <IncidenciaItem key={item.id} item={item} />)
        )}
      </ScrollView>
    </Screen>
  );
}
