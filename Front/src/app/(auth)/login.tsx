// src/app/(auth)/login.tsx
import { ApiError } from "@/api";
import { BradsonLogo, Button, Input, Screen, toast } from "@/components";
import { useAuthStore } from "@/context/authStore";
import { loginSchema, type LoginFormValues } from "@/utils/validaciones";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function Login() {
  const router = useRouter();
  const iniciarSesion = useAuthStore((s) => s.iniciarSesion);
  const [cargando, setCargando] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      correo: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setCargando(true);
    try {
      await iniciarSesion(values);
      toast.exito("¡Bienvenido a Bradson!");
    } catch (e) {
      const mensaje = e instanceof ApiError ? e.message : "Error al iniciar sesión";
      toast.error(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center py-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo oficial y lema */}
          <View className="mb-8">
            <BradsonLogo tamano="lg" mostrarLema />
          </View>

          {/* Formulario */}
          <View className="gap-4">
            <Controller
              control={control}
              name="correo"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Correo Electrónico"
                  icono="mail-outline"
                  placeholder="correo@ejemplo.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.correo?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Contraseña"
                  icono="lock-closed-outline"
                  placeholder="••••••••"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            <View className="mt-2">
              <Button
                titulo="Iniciar Sesión"
                cargando={cargando}
                onPress={() => void handleSubmit(onSubmit)()}
              />
            </View>

            {/* Enlace a Registro */}
            <View className="mt-6 flex-row justify-center items-center">
              <Text className="text-sm text-gray-600">¿No tienes una cuenta? </Text>
              <Pressable onPress={() => router.push("/registro")}>
                <Text className="text-sm font-bold text-brand">Regístrate</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}