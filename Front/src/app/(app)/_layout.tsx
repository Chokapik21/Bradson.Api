import { Stack } from "expo-router";

// Aquí se agregarán después las pantallas de detalle (nueva reserva, pago, calificación).
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
