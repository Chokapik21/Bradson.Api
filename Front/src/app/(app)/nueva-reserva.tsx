// src/app/(app)/nueva-reserva.tsx
import { ApiError, reservasApi } from "@/api";
import { Button, CampoFechaHora, CampoUbicacion, EstadoVacio, Header, Input, Screen, ServicioResumen, SkeletonCard, toast } from "@/components";
import { useReservaStore } from "@/context/reservaStore";
import { useServicio } from "@/hooks/useServicio";
import { aFechaApi, aHoraApi, combinarFechaHora, diaSemanaDe } from "@/utils/fechas";
import { coordenadaDesde, direccionDesde, obtenerUbicacionActual, redondearCoordenada } from "@/utils/ubicacion";
import { reservaSchema, type ReservaFormValues } from "@/utils/validaciones";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import type { LatLng } from "react-native-maps";

type ResultadoSync = LatLng | "sin-cambios" | "fallo";

export default function NuevaReserva() {
  const router = useRouter();
  const { servicioId } = useLocalSearchParams<{ servicioId?: string }>();
  const id = Number(servicioId);
  const { servicio, cargando, error, reintentar } = useServicio(Number.isInteger(id) && id > 0 ? id : null);
  const setBorrador = useReservaStore((s) => s.setBorrador);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<ReservaFormValues>({
    resolver: zodResolver(reservaSchema),
    mode: "onTouched",
    defaultValues: { direccion: "", referencia: "" },
  });

  const ultimaSync = useRef(""); // última dirección ya reflejada en el pin
  const enCurso = useRef<Promise<ResultadoSync> | null>(null);
  const versionPin = useRef(0); // sube cada vez que el usuario mueve el pin a mano

  // Al entrar, intenta ubicar al usuario: pone el pin y sugiere la dirección.
  // Si el usuario ya movió el pin o escribió una dirección, no se pisa nada.
  useEffect(() => {
    let activo = true;
    void (async () => {
      const coord = await obtenerUbicacionActual();
      if (!activo || coord === null || getValues("ubicacion") !== undefined) return;
      setValue("ubicacion", coord, { shouldValidate: true });
      if (getValues("direccion") !== "") return;
      const sugerida = await direccionDesde(coord);
      if (activo && sugerida !== null && getValues("direccion") === "") {
        ultimaSync.current = sugerida.trim();
        setValue("direccion", sugerida, { shouldValidate: true });
      }
    })();
    return () => {
      activo = false;
    };
  }, [getValues, setValue]);

  const sincronizarConDireccion = useCallback((): Promise<ResultadoSync> => {
    if (enCurso.current !== null) return enCurso.current;
    const texto = getValues("direccion").trim();
    if (texto.length < 5 || texto === ultimaSync.current) return Promise.resolve("sin-cambios");

    ultimaSync.current = texto;
    const version = versionPin.current;
    const tarea = coordenadaDesde(texto)
      .then((coord): ResultadoSync => {
        if (versionPin.current !== version) return "sin-cambios"; // el usuario movió el pin: gana el pin
        if (coord === null) {
          ultimaSync.current = ""; // permite reintentar
          toast.info("No encontramos esa dirección en el mapa. Toca el mapa para ubicar el pin.");
          return "fallo";
        }
        setValue("ubicacion", coord, { shouldValidate: true });
        return coord;
      })
      .finally(() => {
        enCurso.current = null;
      });
    enCurso.current = tarea;
    return tarea;
  }, [getValues, setValue]);

  const alElegirUbicacion = async (coord: LatLng, onChange: (c: LatLng) => void): Promise<void> => {
    versionPin.current += 1;
    onChange(coord);
    const sugerida = await direccionDesde(coord);
    if (sugerida !== null) {
      ultimaSync.current = sugerida.trim();
      setValue("direccion", sugerida, { shouldValidate: true });
    } else {
      ultimaSync.current = getValues("direccion").trim();
      toast.info("No pudimos obtener la dirección de ese punto. Revisa que la dirección escrita sea la correcta.");
    }
  };

  const onSubmit = async (valores: ReservaFormValues): Promise<void> => {
    if (servicio === null) return;

    const sync = await sincronizarConDireccion(); // por si escribió la dirección y no salió del campo
    if (sync === "fallo") return;
    const ubicacion = typeof sync === "string" ? valores.ubicacion : sync;

    const cuando = combinarFechaHora(valores.fecha, valores.hora);
    const latitud = redondearCoordenada(ubicacion.latitude);
    const longitud = redondearCoordenada(ubicacion.longitude);

    try {
      const candidatos = await reservasApi.buscarTrabajadoresDisponibles({
        lat: latitud,
        lon: longitud,
        diaSemana: diaSemanaDe(cuando),
        hora: aHoraApi(cuando),
      });

      if (candidatos.length === 0) {
        toast.error("No hay trabajadores disponibles a 10 km para ese día y hora. Prueba con otro horario.");
        return;
      }

      setBorrador({
        servicio,
        fecha: aFechaApi(cuando),
        hora: aHoraApi(cuando),
        direccion: valores.direccion,
        referencia: valores.referencia === "" ? null : valores.referencia,
        latitud,
        longitud,
        trabajador: candidatos[0], // el backend los devuelve ordenados por distancia
      });
      router.push("/pago");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudo verificar la disponibilidad.");
    }
  };

  return (
    <Screen>
      <Header mostrarAtras titulo="Reserva" tituloVerde />

      {cargando ? (
        <View className="mt-4">
          <SkeletonCard />
        </View>
      ) : error !== null || servicio === null ? (
        <View className="mt-6">
          <EstadoVacio icono="cloud-offline-outline" titulo="No pudimos cargar el servicio" mensaje={error ?? undefined} />
          <Button titulo="Reintentar" variante="secundario" onPress={() => void reintentar()} />
        </View>
      ) : (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-8 pt-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ServicioResumen servicio={servicio} />

            <Text className="mb-2 mt-6 text-base font-bold text-gray-900">Fecha y Hora</Text>
            <View className="flex-row items-start gap-3">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="fecha"
                  render={({ field: { value, onChange }, fieldState: { error: err } }) => (
                    <CampoFechaHora modo="date" valor={value} onChange={onChange} minimumDate={new Date()} error={err?.message} />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="hora"
                  render={({ field: { value, onChange }, fieldState: { error: err } }) => (
                    <CampoFechaHora modo="time" valor={value} onChange={onChange} error={err?.message} />
                  )}
                />
              </View>
            </View>

            <View className="mt-2 flex-row items-center gap-1.5 px-1">
              <Ionicons name="information-circle-outline" size={15} color="#6B7280" />
              <Text className="text-xs text-gray-500">
                Las reservas deben programarse con al menos 1 hora de anticipación.
              </Text>
            </View>

            <Text className="mb-2 mt-6 text-base font-bold text-gray-900">Ubicación del Servicio</Text>
            <View className="gap-3">
              <Controller
                control={control}
                name="direccion"
                render={({ field: { value, onChange, onBlur }, fieldState: { error: err } }) => (
                  <Input
                    icono="location-outline"
                    placeholder="Dirección completa"
                    value={value}
                    onChangeText={onChange}
                    onBlur={() => {
                      onBlur();
                      void sincronizarConDireccion();
                    }}
                    error={err?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="referencia"
                render={({ field: { value, onChange, onBlur }, fieldState: { error: err } }) => (
                  <Input
                    placeholder="Apto, torre, conjunto (Opcional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={err?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="ubicacion"
                render={({ field: { value, onChange }, fieldState: { error: err } }) => (
                  <CampoUbicacion
                    value={value}
                    onChange={(coord) => void alElegirUbicacion(coord, onChange)}
                    error={err?.message}
                  />
                )}
              />
            </View>

            <View className="mt-8">
              <Button titulo="Confirmar Datos" cargando={isSubmitting} onPress={() => void handleSubmit(onSubmit)()} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Screen>
  );
}