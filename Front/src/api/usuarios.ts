// src/api/usuarios.ts
import { http } from "./client";
import type { ImagePickerAsset } from "expo-image-picker";
import type { UsuarioDto, UsuarioUpdateDto } from "@/types";

export const usuariosApi = {
  listar: (): Promise<UsuarioDto[]> =>
    http.get<UsuarioDto[]>("/usuarios").then((r) => r.data),

  obtener: (id: number): Promise<UsuarioDto> =>
    http.get<UsuarioDto>(`/usuarios/${id}`).then((r) => r.data),

  subirFoto: (id: number, asset: ImagePickerAsset): Promise<UsuarioDto> => {
    const formulario = new FormData();
    formulario.append("archivo", {
      uri: asset.uri,
      name: asset.fileName ?? `perfil-${id}.jpg`,
      type: asset.mimeType ?? "image/jpeg",
    } as unknown as Blob);
    return http.post<UsuarioDto>(`/usuarios/${id}/foto`, formulario, { timeout: 30000 }).then(
      (r) => r.data,
    );
  },

  actualizar: (id: number, dto: UsuarioUpdateDto): Promise<void> =>
    http.put(`/usuarios/${id}`, dto).then(() => undefined),

  eliminar: (id: number): Promise<void> =>
    http.delete(`/usuarios/${id}`).then(() => undefined),
};