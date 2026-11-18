// src/api/usuarios.ts
import { http } from "./client";
import type { UsuarioDto, UsuarioUpdateDto } from "@/types";

export const usuariosApi = {
  listar: (): Promise<UsuarioDto[]> =>
    http.get<UsuarioDto[]>("/usuarios").then((r) => r.data),

  obtener: (id: number): Promise<UsuarioDto> =>
    http.get<UsuarioDto>(`/usuarios/${id}`).then((r) => r.data),

  actualizar: (id: number, dto: UsuarioUpdateDto): Promise<void> =>
    http.put(`/usuarios/${id}`, dto).then(() => undefined),

  eliminar: (id: number): Promise<void> =>
    http.delete(`/usuarios/${id}`).then(() => undefined),
};