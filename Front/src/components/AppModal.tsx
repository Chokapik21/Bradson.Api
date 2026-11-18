// src/components/AppModal.tsx
import type { ReactNode } from "react";
import { Modal, Pressable, Text } from "react-native";

interface AppModalProps {
  visible: boolean;
  titulo: string;
  onClose: () => void;
  children: ReactNode;
}

export function AppModal({ visible, titulo, onClose, children }: AppModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Tocar el fondo oscuro cierra; el Pressable interno evita que tocar la tarjeta cierre. */}
      <Pressable className="flex-1 items-center justify-center bg-black/50 px-6" onPress={onClose}>
        <Pressable className="w-full rounded-2xl bg-white p-5" onPress={() => undefined}>
          <Text className="mb-3 text-lg font-bold text-gray-900">{titulo}</Text>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}