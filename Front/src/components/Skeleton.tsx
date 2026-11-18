// src/components/Skeleton.tsx
import { useEffect, useRef } from "react";
import { Animated, View, type DimensionValue } from "react-native";
import { Card } from "./Card";

interface SkeletonProps {
  ancho?: DimensionValue;
  alto?: number;
  redondeo?: number;
}

export function Skeleton({ ancho = "100%", alto = 16, redondeo = 8 }: SkeletonProps) {
  const opacidad = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidad, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacidad, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    animacion.start();
    return () => animacion.stop();
  }, [opacidad]);

  return (
    <Animated.View
      style={{ width: ancho, height: alto, borderRadius: redondeo, backgroundColor: "#E5E7EB", opacity: opacidad }}
    />
  );
}

// Forma de una tarjeta de lista (servicio, reserva) mientras carga.
export function SkeletonCard() {
  return (
    <Card>
      <Skeleton ancho="55%" alto={18} />
      <View className="mt-3">
        <Skeleton alto={12} />
      </View>
      <View className="mt-2">
        <Skeleton ancho="80%" alto={12} />
      </View>
    </Card>
  );
}