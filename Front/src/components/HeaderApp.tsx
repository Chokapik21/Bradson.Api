// src/components/HeaderApp.tsx
import type { ComponentProps } from "react";
import { useState } from "react";
import { AppModal } from "./AppModal";
import { Button } from "./Button";
import { EstadoVacio } from "./EstadoVacio";
import { Header } from "./Header";
import { MenuLateral } from "./MenuLateral";

// Reutilizamos las propiedades existentes de Header.
type HeaderAppProps = ComponentProps<typeof Header>;

export function HeaderApp({
  titulo = "Bradson",
  ...props
}: HeaderAppProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  return (
    <>
      <Header
        {...props}
        titulo={titulo}
        tituloVerde
        mostrarMenu
        mostrarNotificacion
        onPressMenu={() => setMenuAbierto(true)}
        onPressNotificacion={() => setNotificacionesAbiertas(true)}
      />

      <MenuLateral
        visible={menuAbierto}
        onClose={() => setMenuAbierto(false)}
      />

      <AppModal
        visible={notificacionesAbiertas}
        titulo="Notificaciones"
        onClose={() => setNotificacionesAbiertas(false)}
      >
        <EstadoVacio
          icono="notifications-off-outline"
          titulo="No tienes notificaciones"
          mensaje="Cuando haya novedades sobre tus reservas, aparecerán aquí."
        />

        <Button
          titulo="Cerrar"
          variante="secundario"
          onPress={() => setNotificacionesAbiertas(false)}
        />
      </AppModal>
    </>
  );
}
