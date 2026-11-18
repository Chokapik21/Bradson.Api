// src/api/auth.ts
import type { AuthResponseDto, LoginDto, UsuarioRegistroDto } from "@/types";
import { http } from "./client";

export const authApi = {
  login: (dto: LoginDto): Promise<AuthResponseDto> =>
    http.post<AuthResponseDto>("/auth/login", dto).then((r) => r.data),

  // El registro vive en /usuarios y devuelve token (auto-login), igual que el login.
  registrar: (dto: UsuarioRegistroDto): Promise<AuthResponseDto> =>
    http.post<AuthResponseDto>("/usuarios", dto).then((r) => r.data),
};