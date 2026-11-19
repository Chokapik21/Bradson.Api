// src/components/Header.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface HeaderProps {
    titulo?: string;
    subtitulo?: string;
    mostrarAtras?: boolean;
    onPressAtras?: () => void;
    mostrarMenu?: boolean;
    mostrarNotificacion?: boolean;
    puntoNotificacion?: boolean;
    derecha?: ReactNode;
    tituloVerde?: boolean;
    onPressMenu?: () => void;
    onPressNotificacion?: () => void;
}

export function Header({
    titulo,
    subtitulo,
    mostrarAtras = false,
    onPressAtras,
    mostrarMenu = false,
    mostrarNotificacion = false,
    puntoNotificacion = false,
    derecha,
    tituloVerde = false,
    onPressMenu,
    onPressNotificacion,
}: HeaderProps) {
    const router = useRouter();

    const handleAtras = () => {
        if (onPressAtras) {
            onPressAtras();
        } else if (router.canGoBack()) {
            router.back();
        }
    };

    return (
        <View className="mb-2 h-14 w-full flex-row items-center justify-between px-1">
            {/* Lado izquierdo: flecha atrás o menú hamburguesa */}
            <View className="w-10 items-start justify-center">
                {mostrarAtras ? (
                    <Pressable
                        accessibilityRole="button"
                        onPress={handleAtras}
                        className="h-10 w-10 items-center justify-center rounded-full active:bg-gray-100"
                    >
                        <Ionicons name="chevron-back" size={26} color="#1F2937" />
                    </Pressable>
                ) : mostrarMenu ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Abrir menú"
                        onPress={onPressMenu}
                        className="h-10 w-10 items-center justify-center rounded-full active:bg-gray-100"
                    >
                        <Ionicons name="menu-outline" size={26} color="#1F2937" />
                    </Pressable>
                ) : null}
            </View>

            {/* Centro: título principal y subtítulo opcional */}
            <View className="flex-1 items-center justify-center">
                {titulo ? (
                    <Text
                        numberOfLines={1}
                        className={`text-lg font-bold ${tituloVerde ? "text-brand" : "text-gray-900"}`}
                    >
                        {titulo}
                    </Text>
                ) : null}
                {subtitulo ? (
                    <Text numberOfLines={1} className="text-xs text-gray-500">
                        {subtitulo}
                    </Text>
                ) : null}
            </View>

            {/* Lado derecho: botón personalizado o campana */}
            <View className="w-10 items-end justify-center">
                {derecha ? (
                    derecha
                ) : mostrarNotificacion ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Notificaciones"
                        onPress={onPressNotificacion}
                        className="h-10 w-10 items-center justify-center rounded-full active:bg-gray-100"
                    >
                        <Ionicons name="notifications-outline" size={24} color="#1F2937" />
                        {puntoNotificacion ? (
                            <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border border-white bg-red-500" />
                        ) : null}
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}