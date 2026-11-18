// src/components/Input.tsx
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, type ComponentProps, type ComponentRef } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

type TextInputInstance = ComponentRef<typeof TextInput>;

interface InputProps extends TextInputProps {
  label?: string;
  icono?: ComponentProps<typeof Ionicons>["name"];
  error?: string;
}

// forwardRef para que React Hook Form pueda enfocar el campo con error.
export const Input = forwardRef<TextInputInstance, InputProps>(function Input(
  { label, icono, error, ...props },
  ref,
) {
  return (
    <View className="w-full">
      {label ? <Text className="mb-1 text-sm font-medium text-gray-800">{label}</Text> : null}
      <View
        className={`h-12 flex-row items-center rounded-full bg-gray-200 px-4 ${
          error ? "border border-red-500" : ""
        }`}
      >
        {icono ? <Ionicons name={icono} size={18} color="#6B7280" /> : null}
        <TextInput
          ref={ref}
          placeholderTextColor="#9CA3AF"
          className="ml-2 flex-1 text-base text-gray-900"
          {...props}
        />
      </View>
      {error ? <Text className="mt-1 px-2 text-xs text-red-600">{error}</Text> : null}
    </View>
  );
});
