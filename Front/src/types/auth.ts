import type { RolUsuario } from "./enums";

export interface UsuarioDto {
  id: number;
  nombre: string;
  documento: string;
  correo: string;
  telefono: string;
  estadoCuenta: string;
  verificado: boolean;
  rol: RolUsuario;
}

export interface LoginDto {
  correo: string;
  password: string;
}

export interface UsuarioRegistroDto {
  nombre: string;
  documento: string;
  correo: string;
  password: string;
  telefono: string;
  rol: RolUsuario;
}

export interface UsuarioUpdateDto {
  nombre: string;
  telefono: string;
  fotoPerfil?: string | null;
}

export interface AuthResponseDto {
  token: string;
  expiracionUtc: string;
  usuario: UsuarioDto;
}