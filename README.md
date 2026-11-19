# Bradson

Aplicación móvil de servicios para el hogar (marketplace cliente–trabajador) con API REST y gestión de reservas, pagos, calificaciones e incidencias.

## Tecnologías

### Frontend (`Front/`)
- Expo (SDK 58) + React Native + TypeScript.
- Expo Router, NativeWind, React Hook Form + Zod, Zustand, Axios.
- `expo-image` y `expo-image-picker` para fotos de perfil.
- `react-native-maps` y `expo-location` para la selección de zona/ubicación.

### Backend (`Back/`)
- .NET 9 (C#), ASP.NET Core Web API REST.
- Entity Framework Core + SQL Server.
- Autenticación con JWT.
- Documentación OpenAPI / Scalar.

### Base de datos (`BD/`)
- SQL Server (Puerto `1433`).
- Script de creación y datos de prueba: `BD/DataBase.sql`.

## Estructura del proyecto

```text
/
├── Front/                  # Aplicación móvil (Expo / React Native / TypeScript)
├── Bradson.Api/                   # API REST (.NET 9 / C#)
├── BD/
│   └── DataBase.sql        # Script completo (esquema + datos de prueba)
└── README.md
```

## Requisitos

- Node.js + npm (para el frontend).
- .NET 9 SDK (para el backend).
- SQL Server (local, puerto 1433).
- Dispositivo físico o emulador con Expo Go (SDK 58).

## Ejecución

### Backend

```bash
cd Back
dotnet run
```

- API: `http://localhost:5019` (HTTP) / `https://localhost:7188` (HTTPS).
- Base de datos: abrir SQL Server Management Studio y ejecutar el script `BD/DataBase.sql`.

### Frontend

1. Copiar `Front/.env.example` a `Front/.env` y colocar la IP local del equipo.
2. Iniciar el proyecto:

```bash
cd Front
npm install
npx expo start
```

- Variables de entorno: `EXPO_PUBLIC_API_URL=http://[IP_ADDRESS]:5019/api`.

## Construcción y verificación

- Backend: `dotnet build Back/Bradson.Api.csproj`
- Frontend (TypeScript): `npx tsc --noEmit` (ejecutar dentro de `Front/`).

## Criterios de entrega

- Buenas prácticas de desarrollo (limpieza de código y arquitectura base).
- Compilación y ejecución exitosa.
- Conexión funcional entre backend y frontend.
- UX y completitud de la solución.