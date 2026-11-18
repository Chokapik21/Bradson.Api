// src/components/CampoUbicacion.tsx
import { COLOR_BRAND } from "@/utils/theme";
import { MEDELLIN, obtenerUbicacionActual } from "@/utils/ubicacion";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import MapView, { Marker, type LatLng } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "./Button";

const DELTA = 0.01;

const regionDe = (c: LatLng) => ({ ...c, latitudeDelta: DELTA, longitudeDelta: DELTA });

interface ContenidoSelectorProps {
  inicial: LatLng;
  onConfirm: (coord: LatLng) => void;
  onClose: () => void;
}

function ContenidoSelector({ inicial, onConfirm, onClose }: ContenidoSelectorProps) {
  const insets = useSafeAreaInsets();
  const mapa = useRef<MapView>(null);
  const [pin, setPin] = useState<LatLng>(inicial);
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const usarMiUbicacion = async (): Promise<void> => {
    setBuscando(true);
    setAviso(null);
    const coord = await obtenerUbicacionActual();
    setBuscando(false);
    if (coord === null) {
      setAviso("No pudimos obtener tu ubicación. Revisa el permiso de ubicación del teléfono.");
      return;
    }
    setPin(coord);
    mapa.current?.animateToRegion(regionDe(coord), 400);
  };

  return (
    <View className="flex-1 bg-white">
      <MapView
        ref={mapa}
        style={{ flex: 1 }}
        initialRegion={regionDe(inicial)}
        toolbarEnabled={false}
        onPress={(e) => setPin(e.nativeEvent.coordinate)}
      >
        <Marker
          coordinate={pin}
          draggable
          pinColor={COLOR_BRAND}
          onDragEnd={(e) => setPin(e.nativeEvent.coordinate)}
        />
      </MapView>

      <View
        className="absolute left-4 right-4 flex-row items-center rounded-2xl border border-gray-200 bg-white px-3 py-2"
        style={{ top: insets.top + 8 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar mapa"
          onPress={onClose}
          className="h-9 w-9 items-center justify-center rounded-full active:bg-gray-100"
        >
          <Ionicons name="close" size={22} color="#1F2937" />
        </Pressable>
        <Text className="ml-2 flex-1 text-sm text-gray-700">{aviso ?? "Toca el mapa o arrastra el pin"}</Text>
      </View>

      <View className="absolute left-4 right-4 gap-3" style={{ bottom: insets.bottom + 16 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Usar mi ubicación"
          onPress={() => void usarMiUbicacion()}
          className="h-12 w-12 items-center justify-center self-end rounded-full border border-gray-200 bg-white"
        >
          {buscando ? <ActivityIndicator color={COLOR_BRAND} /> : <Ionicons name="locate" size={22} color={COLOR_BRAND} />}
        </Pressable>
        <Button titulo="Confirmar ubicación" onPress={() => onConfirm(pin)} />
      </View>
    </View>
  );
}

interface CampoUbicacionProps {
  value: LatLng | undefined;
  onChange: (coord: LatLng) => void;
  error?: string;
}

export function CampoUbicacion({ value, onChange, error }: CampoUbicacionProps) {
  const [abierto, setAbierto] = useState(false);
  const { latitude, longitude } = value ?? MEDELLIN;
  const region = useMemo(
    () => ({ latitude, longitude, latitudeDelta: DELTA, longitudeDelta: DELTA }),
    [latitude, longitude],
  );

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ajustar ubicación en el mapa"
        onPress={() => setAbierto(true)}
        className={`h-44 overflow-hidden rounded-2xl border ${error ? "border-red-500" : "border-gray-200"}`}
      >
        {/* pointerEvents="none": el mapa no se queda con los toques, los recibe el Pressable. */}
        <View pointerEvents="none" style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            region={region}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            toolbarEnabled={false}
          >
            {value !== undefined ? <Marker coordinate={value} pinColor={COLOR_BRAND} /> : null}
          </MapView>
        </View>
        <View className="absolute bottom-2 right-2 flex-row items-center rounded-full bg-white px-3 py-1.5">
          <Ionicons name="pin" size={14} color={COLOR_BRAND} />
          <Text className="ml-1 text-xs font-semibold text-brand-dark">
            {value !== undefined ? "Ajustar Pin" : "Marcar ubicación"}
          </Text>
        </View>
      </Pressable>
      {error ? <Text className="mt-1 px-2 text-xs text-red-600">{error}</Text> : null}

      <Modal visible={abierto} animationType="slide" statusBarTranslucent onRequestClose={() => setAbierto(false)}>
        <ContenidoSelector
          inicial={{ latitude, longitude }}
          onConfirm={(coord) => {
            onChange(coord);
            setAbierto(false);
          }}
          onClose={() => setAbierto(false)}
        />
      </Modal>
    </View>
  );
}