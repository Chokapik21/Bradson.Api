# Bradson

Aplicación móvil de servicios para el hogar (marketplace cliente trabajador) con API REST y panel de reservas, pagos, calificaciones e incidencias.

## Tecnologías

### Frontend (Front/)

- Expo (SDK 58) + React Native + TypeScript.
- Expo Router, NativeWind, react-hook-form + Zod, Zustand, Axios.
- expo-image y expo-image-picker para fotos de perfil.
- 
eact-native-maps y expo-location para la selección de zona/ubicación.

### Backend (Bradson.Api/)

- .NET 9 (C#), ASP.NET Core Web API REST.
- Entity Framework Core + SQL Server.
- Autenticación con JWT.
- Documentación OpenAPI/Scalar.

### Base de datos

- SQL Server (Server=localhost,1433;Database=Bradson.Api;User Id=sa; Password=123456; TrustServerCertificate=True).
- Script DDL: Bradson.Api/Database/schema.sql.

## Estructura

`
/
├── Front/                  # Aplicación móvil (Expo / React Native / TypeScript)
├── Bradson.Api/            # API REST (.NET 9 / C#)
├── Bradson.Api/Database/
│   └── schema.sql         # DDL de la base de datos
|
└── README.md
`

## Requisitos

- Node.js + npm (para el frontend).
- .NET 9 SDK (para el backend).
- SQL Server (local, puerto 1433).
- Dispositivo físico o emulador con Expo Go (SDK 58).

## Ejecución

### Backend

`ash
dotnet run --project Bradson.Api
`

- API: http://localhost:5019 (HTTP) / https://localhost:7188.
- Base de datos: ejecutar Bradson.Api/Database/schema.sql.

### Frontend

`ash
cd Front
npx expo start
`

- Variables de entorno: EXPO_PUBLIC_API_URL=http://192.168.40.24:5019/api.

## Construcción y verificación

- Backend: dotnet build Bradson.Api/Bradson.Api.csproj --nologo -v q -p:OutputPath=/tmp/bradson-build/.
- Frontend (TypeScript): 
px tsc --noEmit.

## Criterios de entrega

- Buenas prácticas de desarrollo (limpieza de código y arquitectura base).
- Compilación y ejecución exitosa.
- Conexión funcional entre backend y frontend.
- UX y completitud de la solución.