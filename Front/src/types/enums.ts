export type RolUsuario = "Cliente" | "Trabajador" | "Administrador";
export type EstadoReserva = "Pendiente" | "EnCurso" | "Finalizado" | "Cancelado";
export type MetodoPago = "Tarjeta" | "PSE" | "Efectivo" | "Otro";
export type EstadoPago = "Pendiente" | "Completado" | "Fallido" | "Reembolsado";
export type EstadoSolucion = "Abierta" | "EnProceso" | "Resuelta" | "Cerrada";
export type DiaSemana =
  | "Lunes" | "Martes" | "Miercoles" | "Jueves" | "Viernes" | "Sabado" | "Domingo";