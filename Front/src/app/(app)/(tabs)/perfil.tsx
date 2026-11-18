// src/app/(app)/(tabs)/perfil.tsx
import { ApiError, usuariosApi } from "@/api";
import { Button, CampoUbicacion, Card, Header, Screen, toast } from "@/components";
import { useAuthStore } from "@/context/authStore";
import { COLOR_BRAND } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";
import type { LatLng } from "react-native-maps";

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

  if (usuario === null) return null;

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

  return (
    <Screen>
      <Header titulo="Perfil" tituloVerde />

      <View className="flex-1 px-4 pt-2 pb-8">
        {/* Datos del usuario */}
        <Card className="mb-4 gap-2 p-4">
          <View className="flex-row items-center gap-3 mb-2">
            <View className="w-12 h-12 rounded-full bg-brand-light items-center justify-center">
              <Ionicons name="person" size={24} color={COLOR_BRAND} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900">{usuario.nombre}</Text>
              <Text className="text-xs text-gray-500">{usuario.rol}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons name="mail-outline" size={15} color="#6B7280" />
            <Text className="text-sm text-gray-600">{usuario.correo}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons name="call-outline" size={15} color="#6B7280" />
            <Text className="text-sm text-gray-600">{usuario.telefono}</Text>
          </View>
        </Card>

        {/* Zona base del Trabajador */}
        {esTrabajador && (
          <Card className="mb-4 p-4 gap-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-bold text-gray-900">Zona base de operación</Text>
                <Text className="text-xs text-gray-500">Radio de cobertura: 10 km</Text>
              </View>
              {/* Indicador de estado */}
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

            {/* Mapa selector */}
            <CampoUbicacion
              value={coordenadas}
              onChange={setCoordenadas}
            />

            <Button
              titulo="Guardar ubicación base"
              cargando={guardandoUbicacion}
              disabled={!coordenadas}
              onPress={() => void guardarUbicacion()}
            />
          </Card>
        )}

        {/* Cerrar sesión */}
        <Button
          titulo="Cerrar sesión"
          variante="secundario"
          onPress={() => void cerrarSesion()}
        />
      </View>
    </Screen>
  );
}

