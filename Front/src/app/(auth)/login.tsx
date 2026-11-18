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
    setValue,
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

  interface CuentaPrueba {
  etiqueta: string;
  correo: string;
  password: string;
}

// Solo existen en desarrollo (__DEV__) y vienen del .env, nunca del código.
const CUENTAS_PRUEBA: CuentaPrueba[] = __DEV__
  ? [
      {
        etiqueta: "Cliente",
        correo: process.env.EXPO_PUBLIC_DEV_CLIENTE_CORREO ?? "",
        password: process.env.EXPO_PUBLIC_DEV_CLIENTE_PASSWORD ?? "",
      },
      {
        etiqueta: "Trabajador",
        correo: process.env.EXPO_PUBLIC_DEV_TRABAJADOR_CORREO ?? "",
        password: process.env.EXPO_PUBLIC_DEV_TRABAJADOR_PASSWORD ?? "",
      },
    ].filter((c) => c.correo !== "" && c.password !== "")
  : [];

  // Función de ayuda para rellenar credenciales de prueba en desarrollo
  const rellenarPrueba = (correo: string, pass: string) => {
    setValue("correo", correo, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
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

            {CUENTAS_PRUEBA.length > 0 ? (
              <View className="mt-4 items-center">
                <Text className="text-xs text-gray-400">Acceso rápido de prueba:</Text>
                <View className="mt-2 flex-row gap-2">
                  {CUENTAS_PRUEBA.map((c) => (
                    <Pressable
                      key={c.etiqueta}
                      onPress={() => rellenarPrueba(c.correo, c.password)}
                      className="rounded-full bg-gray-100 px-3 py-1 active:bg-gray-200"
                    >
                      <Text className="text-xs font-medium text-gray-600">{c.etiqueta}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

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