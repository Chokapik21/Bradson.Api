// src/app/(app)/(tabs)/perfil.tsx
import { ApiError, calificacionesApi, reservasApi, usuariosApi } from "@/api";
import { AppModal, Button, CampoUbicacion, Card, Header, Input, Screen, toast } from "@/components";
import { useAuthStore } from "@/context/authStore";
import { COLOR_BRAND } from "@/utils/theme";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState, type ComponentProps } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import type { LatLng } from "react-native-maps";
import { urlArchivo } from "@/utils/archivo";

interface StatsTrabajador {
  finalizados: number;
  promedio: number | null;
  totalCalificaciones: number;
}

function FilaDato({
  icono,
  etiqueta,
  valor,
}: {
  icono: ComponentProps<typeof Ionicons>["name"];
  etiqueta: string;
  valor: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <Ionicons name={icono} size={17} color="#6B7280" />
      <View className="flex-1">
        <Text className="text-[11px] uppercase tracking-wide text-gray-400">{etiqueta}</Text>
        <Text className="text-sm text-gray-700">{valor}</Text>
      </View>
    </View>
  );
}

export default function Perfil() {
  const usuario = useAuthStore((s) => s.usuario);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);
  const actualizarUsuarioLocal = useAuthStore((s) => s.actualizarUsuarioLocal);

  const esTrabajador = usuario?.rol === "Trabajador";

  // Estado para la sección de ubicación base
  const coordenadasIniciales: LatLng | undefined =
    usuario?.latitud && usuario?.longitud
      ? { latitude: Number(usuario.latitud), longitude: Number(usuario.longitud) }
      : undefined;

  const [coordenadas, setCoordenadas] = useState<LatLng | undefined>(coordenadasIniciales);
  const [guardandoUbicacion, setGuardandoUbicacion] = useState(false);

  // Estado para la edición de datos personales
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [telefono, setTelefono] = useState(usuario?.telefono ?? "");
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [stats, setStats] = useState<StatsTrabajador | null>(null);
  const [verAcerca, setVerAcerca] = useState(false);

  const cargarStats = useCallback((): void => {
    if (usuario?.rol !== "Trabajador") return;
    Promise.all([reservasApi.listar(), calificacionesApi.listar()])
      .then(([reservas, calificaciones]) =>
        setStats({
          finalizados: reservas.filter((r) => r.estado === "Finalizado").length,
          promedio:
            calificaciones.length === 0
              ? null
              : calificaciones.reduce((total, c) => total + c.puntuacion, 0) /
                calificaciones.length,
          totalCalificaciones: calificaciones.length,
        }),
      )
      .catch(() => setStats(null));
  }, [usuario?.rol]);

  useFocusEffect(
    useCallback(() => {
      cargarStats();
    }, [cargarStats]),
  );

  if (usuario === null) return null;

  const subirFotoPerfil = async (): Promise<void> => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      toast.error("Necesitamos permiso para acceder a tus fotos.");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (resultado.canceled || resultado.assets === null) return;

    const asset = resultado.assets[0];
    if (asset === undefined) return;

    setSubiendoFoto(true);
    try {
      const actualizada = await usuariosApi.subirFoto(usuario.id, asset);
      await actualizarUsuarioLocal({ fotoPerfil: actualizada.fotoPerfil });
      toast.exito("Foto de perfil actualizada.");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudo subir la foto de perfil.");
    } finally {
      setSubiendoFoto(false);
    }
  };

  const tieneUbicacion = !!coordenadas;

  const guardarUbicacion = async (): Promise<void> => {
    if (!coordenadas) {
      toast.error("Selecciona una ubicación en el mapa primero.");
      return;
    }
    setGuardandoUbicacion(true);
    try {
      await usuariosApi.actualizar(usuario.id, {
        nombre: usuario.nombre,
        telefono: usuario.telefono,
        latitud: coordenadas.latitude,
        longitud: coordenadas.longitude,
        // Generamos una dirección de referencia con las coordenadas.
        // En una versión futura se puede integrar geocodificación inversa.
        direccion: `${coordenadas.latitude.toFixed(6)}, ${coordenadas.longitude.toFixed(6)}`,
      });
      // Actualizar el store local sin necesidad de hacer logout/login
      await actualizarUsuarioLocal({
        latitud: coordenadas.latitude,
        longitud: coordenadas.longitude,
        direccion: `${coordenadas.latitude.toFixed(6)}, ${coordenadas.longitude.toFixed(6)}`,
      });
      toast.exito("Ubicación base guardada correctamente.");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudo guardar la ubicación.");
    } finally {
      setGuardandoUbicacion(false);
    }
  };

  const cancelarEdicion = (): void => {
    setNombre(usuario.nombre);
    setTelefono(usuario.telefono);
    setEditando(false);
  };

  const guardarDatos = async (): Promise<void> => {
    const nombreLimpio = nombre.trim();
    const telefonoLimpio = telefono.trim();

    if (nombreLimpio.length < 2) {
      toast.error("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (!/^\+?\d{7,15}$/.test(telefonoLimpio)) {
      toast.error("Ingresa un teléfono válido (7 a 15 dígitos).");
      return;
    }

    setGuardandoDatos(true);
    try {
      await usuariosApi.actualizar(usuario.id, {
        nombre: nombreLimpio,
        telefono: telefonoLimpio,
        latitud: usuario.latitud ?? undefined,
        longitud: usuario.longitud ?? undefined,
        direccion: usuario.direccion ?? undefined,
      });
      await actualizarUsuarioLocal({ nombre: nombreLimpio, telefono: telefonoLimpio });
      toast.exito("Datos personales actualizados.");
      setEditando(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudieron guardar tus datos.");
    } finally {
      setGuardandoDatos(false);
    }
  };

  const confirmarSalida = (): void => {
    Alert.alert("Cerrar sesión", "¿Seguro que deseas salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => void cerrarSesion() },
    ]);
  };

  return (
    <Screen>
      <Header titulo="Perfil" tituloVerde />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-0 pt-2 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <Card className="mb-4 p-4">
          <View className="flex-row items-center gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cambiar foto de perfil"
              disabled={subiendoFoto}
              onPress={() => void subirFotoPerfil()}
              className="h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-brand-light"
            >
              {usuario.fotoPerfil ? (
                <Image
                  source={{ uri: urlArchivo(usuario.fotoPerfil) ?? undefined }}
                  style={{ width: 56, height: 56 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <Ionicons name="person" size={26} color={COLOR_BRAND} />
              )}
              <View style={{ position: "absolute", right: 0, bottom: 0 }} className="h-6 w-6 items-center justify-center rounded-full bg-brand">
                <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
              </View>
            </Pressable>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900">{usuario.nombre}</Text>
              <View className="mt-1 flex-row items-center gap-2">
                <View className="rounded-full bg-brand-light px-2 py-0.5">
                  <Text className="text-[11px] font-bold text-brand-dark">{usuario.rol}</Text>
                </View>
                {usuario.verificado ? (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="shield-checkmark" size={13} color={COLOR_BRAND} />
                    <Text className="text-[11px] font-semibold text-brand">Verificado</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </Card>

        {/* Datos personales */}
        <Text className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
          Datos personales
        </Text>
        <Card className="mb-4 gap-3 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-gray-900">
              {editando ? "Editar datos" : "Información de contacto"}
            </Text>
            {!editando ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setEditando(true)}
                className="flex-row items-center gap-1 active:opacity-70"
              >
                <Ionicons name="create-outline" size={16} color={COLOR_BRAND} />
                <Text className="text-sm font-semibold text-brand">Editar</Text>
              </Pressable>
            ) : null}
          </View>

          {editando ? (
            <>
              <Input
                icono="person-outline"
                placeholder="Nombre completo"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
              />
              <Input
                icono="call-outline"
                placeholder="Teléfono"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
              />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button
                    titulo="Guardar"
                    cargando={guardandoDatos}
                    onPress={() => void guardarDatos()}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    titulo="Cancelar"
                    variante="secundario"
                    disabled={guardandoDatos}
                    onPress={cancelarEdicion}
                  />
                </View>
              </View>
            </>
          ) : (
            <View className="gap-3">
              <FilaDato icono="mail-outline" etiqueta="Correo" valor={usuario.correo} />
              <FilaDato icono="call-outline" etiqueta="Teléfono" valor={usuario.telefono} />
              <FilaDato icono="card-outline" etiqueta="Documento" valor={usuario.documento} />
            </View>
          )}
        </Card>

        {/* Actividad del Trabajador */}
        {esTrabajador ? (
          <>
            <Text className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
              Mi actividad
            </Text>
            <Card className="mb-4 p-4">
              <View className="flex-row gap-3">
                <View className="flex-1 items-center rounded-xl bg-brand-light py-3">
                  <Text className="text-xl font-extrabold text-brand">
                    {stats?.finalizados ?? 0}
                  </Text>
                  <Text className="text-xs text-gray-600">Completados</Text>
                </View>
                <View className="flex-1 items-center rounded-xl bg-yellow-50 py-3">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text className="text-xl font-extrabold text-yellow-700">
                      {stats?.promedio != null ? stats.promedio.toFixed(1) : "—"}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-600">
                    {stats && stats.totalCalificaciones > 0
                      ? `${stats.totalCalificaciones} reseñas`
                      : "Sin reseñas"}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Zona base del Trabajador */}
            <Text className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
              Zona de trabajo
            </Text>
            <Card className="mb-4 gap-4 p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-bold text-gray-900">Zona base de operación</Text>
                  <Text className="text-xs text-gray-500">Radio de cobertura: 10 km</Text>
                </View>
                <View
                  className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${
                    tieneUbicacion ? "bg-brand-light" : "bg-yellow-50"
                  }`}
                >
                  <Ionicons
                    name={tieneUbicacion ? "checkmark-circle" : "alert-circle-outline"}
                    size={14}
                    color={tieneUbicacion ? COLOR_BRAND : "#B45309"}
                  />
                  <Text
                    className={`text-xs font-semibold ${
                      tieneUbicacion ? "text-brand" : "text-yellow-700"
                    }`}
                  >
                    {tieneUbicacion ? "Configurada" : "Sin ubicación"}
                  </Text>
                </View>
              </View>

              <CampoUbicacion value={coordenadas} onChange={setCoordenadas} />

              <Button
                titulo="Guardar ubicación base"
                cargando={guardandoUbicacion}
                disabled={!coordenadas}
                onPress={() => void guardarUbicacion()}
              />
            </Card>
          </>
        ) : null}

        {/* Aplicación */}
        <Text className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
          Aplicación
        </Text>
        <Card className="mb-6 overflow-hidden p-0">
          <Pressable
            accessibilityRole="button"
            onPress={() => setVerAcerca(true)}
            className="flex-row items-center gap-3 p-4 active:bg-gray-50"
          >
            <Ionicons name="information-circle-outline" size={20} color={COLOR_BRAND} />
            <Text className="flex-1 text-sm text-gray-800">Acerca de Bradson</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </Pressable>
        </Card>

        {/* Cerrar sesión */}
        <Button titulo="Cerrar sesión" variante="secundario" onPress={confirmarSalida} />
      </ScrollView>

      <AppModal
        visible={verAcerca}
        titulo="Acerca de Bradson"
        onClose={() => setVerAcerca(false)}
      >
        <Text className="text-sm text-gray-700">
          Bradson conecta clientes con trabajadores de servicios para el hogar: limpieza,
          decoración y más, con agenda, seguimiento y calificaciones.
        </Text>
        <Text className="mt-3 text-xs text-gray-400">Versión 1.0.0</Text>

        <View className="mt-4">
          <Button
            titulo="Cerrar"
            variante="secundario"
            onPress={() => setVerAcerca(false)}
          />
        </View>
      </AppModal>
    </Screen>
  );
}
