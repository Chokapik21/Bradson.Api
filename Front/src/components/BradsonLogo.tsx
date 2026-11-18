// src/components/BradsonLogo.tsx
import { COLOR_BRAND } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface BradsonLogoProps {
    tamano?: "sm" | "md" | "lg";
    mostrarLema?: boolean;
}

export function BradsonLogo({ tamano = "lg", mostrarLema = true }: BradsonLogoProps) {
    const circuloClase =
        tamano === "lg" ? "h-24 w-24" : tamano === "md" ? "h-16 w-16" : "h-10 w-10";
    const iconSize = tamano === "lg" ? 44 : tamano === "md" ? 30 : 20;
    const textoTituloClase =
        tamano === "lg" ? "text-3xl" : tamano === "md" ? "text-2xl" : "text-xl";

    return (
        <View className="items-center justify-center">
            {/* Círculo verde característico de Bradson */}
            <View
                className={`${circuloClase} items-center justify-center rounded-full bg-brand`}
                style={{
                    shadowColor: COLOR_BRAND,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 5,
                }}
            >
                <Ionicons
                    name="sparkles"
                    size={iconSize * 0.4}
                    color="#CFF1DF"
                    style={{ position: "absolute", top: 8, right: 12 }}
                />
                <Ionicons name="home" size={iconSize} color="#FFFFFF" />
                <Text className="mt-[-2px] text-[10px] font-extrabold tracking-wider text-white">
                    bradson
                </Text>
            </View>

            {/* Nombre de la marca */}
            <Text className={`mt-3 font-extrabold text-brand tracking-tight ${textoTituloClase}`}>
                Bradson
            </Text>

            {/* Lema */}
            {mostrarLema ? (
                <Text className="mt-1 text-center text-sm font-medium text-gray-500">
                    Hogar limpio, espacio con armonía
                </Text>
            ) : null}
        </View>
    );
}