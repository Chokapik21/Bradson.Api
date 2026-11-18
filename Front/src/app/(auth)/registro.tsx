// src/app/(auth)/registro.tsx
import { ApiError } from "@/api";
import { Button, Header, Input, Screen, toast } from "@/components";
import { useAuthStore } from "@/context/authStore";
import { COLOR_BRAND } from "@/utils/theme";
import { registroSchema, type RegistroFormValues } from "@/utils/validaciones";
import { Ionicons } from "@expo/vector-icons";
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

export default function Registro() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
    mode: "onTouched",
    defaultValues: {
      nombre: "",
      documento: "",
      telefono: "",
      correo: "",
      password: "",
      rol: "Cliente",
    },
  });

  const rolSeleccionado = watch("rol");

  const seleccionarRol = (nuevoRol: "Cliente" | "Trabajador") => {
    setValue("rol", nuevoRol, { shouldValidate: true });
  };

  const registrar = useAuthStore((s) => s.registrar);

  const onSubmit = async (values: RegistroFormValues): Promise<void> => {
    setCargando(true);
    try {
      await registrar(values);
      toast.exito("¡Cuenta creada! Bienvenido a Bradson");
      // No hace falta redirigir: al cambiar la sesión, el guard te lleva a la app.
    } catch (e) {
    toast.error(e instanceof ApiError ? e.message : "Error al registrar usuario");
    } finally {
    setCargando(false);
  }
};

  return (
    <Screen>
      <Header mostrarAtras titulo="Crear Cuenta" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="py-4 pb-12"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Selector de Rol (Cliente vs Trabajador) - RF-01 */}
          <View className="mb-6 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={() => seleccionarRol("Cliente")}
              className={`flex-1 flex-row items-center justify-center rounded-2xl border py-3.5 ${rolSeleccionado === "Cliente"
                  ? "border-brand bg-brand-light/30"
                  : "border-gray-200 bg-white"
                }`}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={rolSeleccionado === "Cliente" ? COLOR_BRAND : "#6B7280"}
              />
              <Text
                className={`ml-2 text-sm font-bold ${rolSeleccionado === "Cliente" ? "text-brand-dark" : "text-gray-600"
                  }`}
              >
                Cliente
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => seleccionarRol("Trabajador")}
              className={`flex-1 flex-row items-center justify-center rounded-2xl border py-3.5 ${rolSeleccionado === "Trabajador"
                  ? "border-brand bg-brand-light/30"
                  : "border-gray-200 bg-white"
                }`}
            >
              <Ionicons
                name="briefcase-outline"
                size={20}
                color={rolSeleccionado === "Trabajador" ? COLOR_BRAND : "#6B7280"}
              />
              <Text
                className={`ml-2 text-sm font-bold ${rolSeleccionado === "Trabajador" ? "text-brand-dark" : "text-gray-600"
                  }`}
              >
                Trabajador
              </Text>
            </Pressable>
          </View>

          {/* Formulario alineado con TBL_Usuarios */}
          <View className="gap-3.5">
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  icono="person-outline"
                  placeholder="Nombre Completo"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.nombre?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="documento"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  icono="card-outline"
                  placeholder="Documento de identidad"
                  keyboardType="number-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.documento?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="telefono"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  icono="call-outline"
                  placeholder="Teléfono"
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.telefono?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="correo"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  icono="mail-outline"
                  placeholder="Correo Electrónico"
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
                  icono="lock-closed-outline"
                  placeholder="Contraseña (mínimo 8 caracteres)"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            <View className="mt-4">
              <Button
                titulo="Registrarme"
                cargando={cargando}
                onPress={() => void handleSubmit(onSubmit)()}
              />
            </View>

            {/* Enlace para volver a Iniciar Sesión */}
            <View className="mt-6 flex-row justify-center items-center">
              <Text className="text-sm text-gray-600">¿Ya tienes una cuenta? </Text>
              <Pressable onPress={() => router.back()}>
                <Text className="text-sm font-bold text-brand">Inicia sesión</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}