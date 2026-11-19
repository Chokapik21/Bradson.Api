// src/app/(app)/(tabs)/disponibilidad.tsx
import { ApiError, disponibilidadesApi } from "@/api";
import { AppModal, Button, EstadoVacio, Header, Screen, SkeletonCard } from "@/components";
import { useAuthStore } from "@/context/authStore";
import type { DiaSemana, DisponibilidadDto } from "@/types";
import { COLOR_BRAND } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

// ─── Constantes ──────────────────────────────────────────────────────────────
const DIAS_SEMANA: DiaSemana[] = [
  "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo",
];

const HORA_MIN = "07:00";
const HORA_MAX = "18:00";
const HORA_MIN_MINUTOS = 7 * 60;
const HORA_MAX_MINUTOS = 18 * 60;

const DIAS_DISPLAY: Record<DiaSemana, string> = {
  Lunes: "Lunes",
  Martes: "Martes",
  Miercoles: "Miércoles",
  Jueves: "Jueves",
  Viernes: "Viernes",
  Sabado: "Sábado",
  Domingo: "Domingo",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convierte "HH:mm" o "HH:mm:ss" a minutos desde medianoche para comparar */
function horaAMinutos(hora: string): number {
  const [h = "0", m = "0"] = hora.split(":");
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

/** Valida formato HH:mm */
function esHoraValida(h: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(h);
}

/** Formatea "HH:mm:ss" → "HH:mm" para mostrar */
function formatHora(h: string): string {
  return h.slice(0, 5);
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function Disponibilidad() {
  const usuario = useAuthStore((s) => s.usuario);

  const [franjas, setFranjas] = useState<DisponibilidadDto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Estado del formulario de nueva franja
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>("Lunes");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [erroresForm, setErroresForm] = useState<{ inicio?: string; fin?: string }>({});
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async (esRefresco = false): Promise<void> => {
    if (esRefresco) setRefrescando(true);
    else setCargando(true);
    setError(null);
    try {
      const data = await disponibilidadesApi.listar();
      setFranjas(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al cargar disponibilidades.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const abrirModal = (): void => {
    setDiaSeleccionado("Lunes");
    setHoraInicio("");
    setHoraFin("");
    setErroresForm({});
    setModalVisible(true);
  };

  const validarYGuardar = async (): Promise<void> => {
    const errs: { inicio?: string; fin?: string } = {};
    if (!esHoraValida(horaInicio)) errs.inicio = "Formato inválido. Usa HH:mm (ej. 07:00)";
    if (!esHoraValida(horaFin)) errs.fin = "Formato inválido. Usa HH:mm (ej. 18:00)";
    if (
      !errs.inicio &&
      (horaAMinutos(horaInicio) < HORA_MIN_MINUTOS || horaAMinutos(horaInicio) > HORA_MAX_MINUTOS)
    ) {
      errs.inicio = `La hora debe estar entre ${HORA_MIN} y ${HORA_MAX}.`;
    }
    if (
      !errs.fin &&
      (horaAMinutos(horaFin) < HORA_MIN_MINUTOS || horaAMinutos(horaFin) > HORA_MAX_MINUTOS)
    ) {
      errs.fin = `La hora debe estar entre ${HORA_MIN} y ${HORA_MAX}.`;
    }
    if (!errs.inicio && !errs.fin && horaAMinutos(horaFin) <= horaAMinutos(horaInicio)) {
      errs.fin = "La hora de fin debe ser posterior a la de inicio.";
    }
    if (Object.keys(errs).length > 0) {
      setErroresForm(errs);
      return;
    }

    if (!usuario) return;
    setGuardando(true);
    try {
      const nueva = await disponibilidadesApi.crear({
        diaSemana: diaSeleccionado,
        horaInicio: `${horaInicio}:00`,
        horaFin: `${horaFin}:00`,
        idTrabajador: usuario.id,
      });
      setFranjas((prev) => [...prev, nueva]);
      setModalVisible(false);
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof ApiError ? e.message : "No se pudo guardar la franja."
      );
    } finally {
      setGuardando(false);
    }
  };

  const eliminarFranja = (id: number): void => {
    Alert.alert(
      "Eliminar franja",
      "¿Seguro que deseas eliminar este horario de disponibilidad?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await disponibilidadesApi.eliminar(id);
              setFranjas((prev) => prev.filter((f) => f.id !== id));
            } catch (e) {
              Alert.alert(
                "Error",
                e instanceof ApiError ? e.message : "No se pudo eliminar la franja."
              );
            }
          },
        },
      ]
    );
  };

  // Agrupar franjas por día y ordenar por horaInicio
  const franjasPorDia = DIAS_SEMANA.reduce<Record<DiaSemana, DisponibilidadDto[]>>(
    (acc, dia) => {
      acc[dia] = franjas
        .filter((f) => f.diaSemana === dia)
        .sort((a, b) => horaAMinutos(a.horaInicio) - horaAMinutos(b.horaInicio));
      return acc;
    },
    {} as Record<DiaSemana, DisponibilidadDto[]>
  );

  const diasConFranjas = DIAS_SEMANA.filter((d) => franjasPorDia[d].length > 0);

  return (
    <Screen>
      <Header titulo="Disponibilidad" tituloVerde />

      {cargando ? (
        <View className="p-4 gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : error !== null ? (
        <View className="flex-1 items-center justify-center p-4 gap-4">
          <EstadoVacio icono="alert-circle-outline" titulo="Error al cargar" mensaje={error} />
          <Button titulo="Reintentar" variante="secundario" onPress={() => void cargar()} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-8 px-4 pt-2"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={() => void cargar(true)}
              colors={[COLOR_BRAND]}
            />
          }
        >
          {/* Botón agregar */}
          <View className="mb-5">
            <Button
              titulo="+ Agregar franja horaria"
              onPress={abrirModal}
            />
          </View>

          {/* Sin franjas */}
          {franjas.length === 0 ? (
            <EstadoVacio
              icono="time-outline"
              titulo="Sin horarios registrados"
              mensaje="Agrega tus franjas disponibles para que los clientes puedan encontrarte."
            />
          ) : (
            diasConFranjas.map((dia) => (
              <View key={dia} className="mb-5">
                <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {DIAS_DISPLAY[dia]}
                </Text>
                <View className="gap-2">
                  {franjasPorDia[dia].map((f) => (
                    <View
                      key={f.id}
                      className="flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3"
                    >
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="time-outline" size={18} color={COLOR_BRAND} />
                        <Text className="text-base font-semibold text-gray-800">
                          {formatHora(f.horaInicio)} – {formatHora(f.horaFin)}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => eliminarFranja(f.id)}
                        className="h-9 w-9 items-center justify-center rounded-full bg-red-50 active:opacity-70"
                        accessibilityLabel="Eliminar franja"
                        accessibilityRole="button"
                      >
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Modal para nueva franja */}
      <AppModal visible={modalVisible} titulo="Nueva franja horaria" onClose={() => setModalVisible(false)}>
        {/* Selector de día */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Día de la semana</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2 pb-1">
            {DIAS_SEMANA.map((dia) => (
              <Pressable
                key={dia}
                onPress={() => setDiaSeleccionado(dia)}
                className={`px-3 py-2 rounded-full border ${
                  diaSeleccionado === dia
                    ? "bg-brand border-brand"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    diaSeleccionado === dia ? "text-white" : "text-gray-700"
                  }`}
                >
                  {DIAS_DISPLAY[dia].slice(0, 3)}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Hora inicio */}
        <Text className="text-sm font-semibold text-gray-700 mb-1">Hora inicio (HH:mm)</Text>
        <TextInput
          value={horaInicio}
          onChangeText={(t) => { setHoraInicio(t); setErroresForm((p) => ({ ...p, inicio: undefined })); }}
          placeholder={HORA_MIN}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
          className={`mb-1 h-11 rounded-xl border px-3 text-base text-gray-800 ${
            erroresForm.inicio ? "border-red-500" : "border-gray-300"
          }`}
        />
        {erroresForm.inicio ? (
          <Text className="mb-2 text-xs text-red-600">{erroresForm.inicio}</Text>
        ) : <View className="mb-2" />}

        {/* Hora fin */}
        <Text className="text-sm font-semibold text-gray-700 mb-1">Hora fin (HH:mm)</Text>
        <TextInput
          value={horaFin}
          onChangeText={(t) => { setHoraFin(t); setErroresForm((p) => ({ ...p, fin: undefined })); }}
          placeholder={HORA_MAX}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
          className={`mb-1 h-11 rounded-xl border px-3 text-base text-gray-800 ${
            erroresForm.fin ? "border-red-500" : "border-gray-300"
          }`}
        />
        {erroresForm.fin ? (
          <Text className="mb-2 text-xs text-red-600">{erroresForm.fin}</Text>
        ) : null}

        <Text className="mb-3 text-xs text-gray-500">
          Horario permitido: {HORA_MIN} – {HORA_MAX}.
        </Text>

        <Button titulo="Guardar franja" cargando={guardando} onPress={() => void validarYGuardar()} />
      </AppModal>
    </Screen>
  );
}

