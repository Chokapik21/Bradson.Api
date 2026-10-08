# Bradson API

API REST para Bradson — plataforma digital de servicios de aseo y decoración en Medellín.
Desarrollada en ASP.NET Core Web API + Entity Framework Core (Code-First) + SQL Server.

## Requisitos previos
- .NET SDK (la versión indicada en `Bradson.Api.csproj`, `<TargetFramework>`)
- SQL Server (LocalDB, Express o una instancia completa administrada con SQL Server Management Studio)
- Herramienta `dotnet-ef`: `dotnet tool install --global dotnet-ef`

## Configuración de la base de datos
La cadena de conexión NO se incluye con credenciales reales. Configúrala por una de estas dos vías:

**Opción A — variable de entorno:**
```
ConnectionStrings__BradsonDB="Server=localhost,1433;DataBase=Bradson.Api;User Id=sa; Password=123456; TrustServerCertificate=True;"
```
(si tu instancia usa autenticación de SQL Server en vez de Windows, reemplaza `Trusted_Connection=True` por `User Id=tu_usuario;Password=tu_password;`)

**Opción B — User Secrets (desarrollo local):**
```
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:BradsonDB" "Server=localhost;Database=bradson_db;Trusted_Connection=True;TrustServerCertificate=True;"
```

## Crear la base de datos
```
dotnet ef database update
```
Crea la base `bradson_db` y las 8 tablas a partir de las migraciones en `/Migrations`.
El script DDL puro está en `/Database/schema.sql`.

## Ejecutar la API
```
dotnet run
```
- Documento OpenAPI: `https://localhost:{puerto}/openapi/v1.json`
- Documentación interactiva (Scalar): `https://localhost:{puerto}/scalar/v1`

## Modelo de datos
8 entidades: `Usuario`, `Servicio`, `Reserva`, `Pago`, `DetallePago`, `Calificacion`, `Incidencia`, `Disponibilidad`.

> **Nota sobre pagos en línea:** una pasarela real (Wompi, PayU, etc.) requiere cuenta de comercio y
> desarrollo adicional fuera de alcance. El flujo se simula en `PATCH /api/pagos/{id}/procesar`,
> generando referencia y código de respuesta en `DetallePago`, dejando el modelo listo para integración futura.

## Autor
Davinson Mesa