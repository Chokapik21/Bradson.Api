// src/hooks/useNotificaciones.ts
import { calificacionesApi, disponibilidadesApi, reservasApi } from "@/api";
import { useAuthStore } from "@/context/authStore";
import type { ReservaDto } from "@/types";
import { formatearFechaHoraApi, milisegundosReserva } from "@/utils/fechas";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, type Href } from "expo-router";
import { useCallback, useState, type ComponentProps } from "react";

export type TonoNotificacion = "info" | "alerta" | "exito";

export interface NotificacionApp {
  id: string;
  icono: ComponentProps<typeof Ionicons>["name"];
  tono: TonoNotificacion;
  titulo: string;
  mensaje: string;
  ruta: Href;
}

const MAX_NOTIFICACIONES = 6;

export function useNotificaciones() {
  const usuario = useAuthStore((s) => s.usuario);
  const [notificaciones, setNotificaciones] = useState<NotificacionApp[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async (): Promise<void> => {
    if (!usuario) {
      setNotificaciones([]);
      setCargando(false);
      return;
    }

    const [reservas, calificaciones, disponibilidades] = await Promise.all([
      reservasApi.listar().catch((): ReservaDto[] => []),
      calificacionesApi.listar().catch(() => []),
      usuario.rol === "Trabajador"
        ? disponibilidadesApi.listar().catch(() => [])
        : Promise.resolve([]),
    ]);

    const resultado: NotificacionApp[] = [];

    if (usuario.rol === "Trabajador") {
      if (!usuario.latitud || !usuario.longitud) {
        resultado.push({
          id: "config-ubicacion",
          icono: "location-outline",
          tono: "alerta",
          titulo: "Configura tu ubicación base",
          mensaje: "Sin ella no apareces en el radar de los clientes.",
          ruta: "/(app)/(tabs)/perfil",
        });
      }
      if (disponibilidades.length === 0) {
        resultado.push({
          id: "config-horarios",
          icono: "time-outline",
          tono: "alerta",
          titulo: "Agrega tus horarios",
          mensaje: "Registra tu disponibilidad para recibir reservas.",
          ruta: "/(app)/(tabs)/disponibilidad",
        });
      }
    }

    const porFecha = (a: ReservaDto, b: ReservaDto) =>
      milisegundosReserva(a.fecha, a.hora) - milisegundosReserva(b.fecha, b.hora);

    const enCurso = reservas.filter((r) => r.estado === "EnCurso").sort(porFecha);
    for (const reserva of enCurso) {
      resultado.push({
        id: `en-curso-${reserva.id}`,
        icono: "construct-outline",
        tono: "info",
        titulo: "Servicio en curso",
        mensaje: `${reserva.nombreServicio || "Servicio"} · ${
          usuario.rol === "Trabajador"
            ? reserva.nombreCliente || "Cliente"
            : reserva.nombreTrabajador || "Trabajador"
        }`,
        ruta: `/(app)/reserva/${reserva.id}`,
      });
    }

    const pendientes = reservas.filter((r) => r.estado === "Pendiente").sort(porFecha);
    for (const reserva of pendientes) {
      resultado.push({
        id: `pendiente-${reserva.id}`,
        icono: "calendar-outline",
        tono: "info",
        titulo: "Servicio programado",
        mensaje: `${formatearFechaHoraApi(reserva.fecha, reserva.hora)} · ${
          reserva.nombreServicio || "Servicio"
        }`,
        ruta: `/(app)/reserva/${reserva.id}`,
      });
    }

    if (usuario.rol === "Cliente") {
      const calificadas = new Set(calificaciones.map((c) => c.idReserva));
      const porCalificar = reservas
        .filter((r) => r.estado === "Finalizado" && !calificadas.has(r.id))
        .sort((a, b) => porFecha(b, a))
        .slice(0, 2);

      for (const reserva of porCalificar) {
        resultado.push({
          id: `calificar-${reserva.id}`,
          icono: "star-outline",
          tono: "exito",
          titulo: "Califica tu servicio",
          mensaje: `¿Cómo estuvo ${reserva.nombreServicio || "el servicio"}?`,
          ruta: `/(app)/reserva/${reserva.id}`,
        });
      }
    }

    setNotificaciones(resultado.slice(0, MAX_NOTIFICACIONES));
    setCargando(false);
  }, [usuario]);

  useFocusEffect(
    useCallback(() => {
      void cargar();
    }, [cargar]),
  );

  return { notificaciones, cargando };
}
