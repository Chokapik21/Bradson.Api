# Bradson API

API REST para Bradson — plataforma digital de servicios de aseo y decoración en Medellín.
Desarrollada en ASP.NET Core Web API + Entity Framework Core (Code-First) + SQL Server.

## Arquitectura

El proyecto sigue una separación por capas estándar de ASP.NET Core:

- **Controllers**: exponen los endpoints REST (uno por entidad). Nunca devuelven las entidades de EF Core directamente, siempre un DTO — esto evita ciclos infinitos al serializar relaciones (ej. `Reserva` → `Usuario` → `Reserva`...) y controla exactamente qué campos salen por HTTP (por ejemplo, `ContrasenaHash` nunca se expone).
- **Dtos**: las formas de entrada/salida de cada endpoint, con sus validaciones (`[Required]`, `[Range]`, etc.).
- **Models**: las clases que representan las tablas (entidades de EF Core).
- **Data/BradsonDbContext.cs**: configura las relaciones entre entidades (claves foráneas, comportamiento de borrado, conversión de enums a texto).
- **Migrations**: historial versionado de cómo se construyó el esquema de la base de datos.

## Modelo de datos

8 entidades:

Entidad--Qué representa
`Usuario` -- Clientes, trabajadores y administradores (un solo catálogo, diferenciado por el campo `Rol`)
`Servicio` -- Catálogo de categorías de servicio ofrecidas (aseo, decoración) y su tarifa base
`Reserva` -- Una solicitud de servicio concreta: conecta un cliente, un trabajador y un servicio
`Pago` -- La transacción económica de una Reserva (monto bruto, comisión, monto neto, estado)
`DetallePago` -- Datos específicos de la pasarela de pago (referencia, token, código de respuesta)
`Calificacion` -- Reseña de 1 a 5 estrellas que deja el cliente al finalizar una Reserva
`Incidencia` -- Novedades reportadas sobre una Reserva (daños, ausencias, reclamos)
`Disponibilidad` -- Horarios en que un Usuario con rol Trabajador puede recibir reservas

El esquema SQL exacto (tablas, claves, relaciones) está en `/Database/schema.sql`.

## Funcionalidades y reglas de negocio

Además del CRUD estándar por tabla, la API implementa:

- **Filtro geolocalizado** — `GET /api/reservas/trabajadores-disponibles`: devuelve solo trabajadores activos, verificados, disponibles ese día/hora y a 10 km o menos del cliente (distancia calculada con la fórmula de Haversine).
- **Máquina de estados de Reserva** — `PATCH /api/reservas/{id}/estado`: solo permite transiciones válidas (`Pendiente → EnCurso → Finalizado`, o `→ Cancelado`). Al pasar a `Finalizado`, genera automáticamente el `Pago` correspondiente con el 20% de comisión.
- **Simulación de pasarela de pago** — `PATCH /api/pagos/{id}/procesar`: simula la respuesta de un proveedor real (~90% de aprobación), generando el `DetallePago` asociado. Ver nota de alcance más abajo.
- **Transiciones de Incidencia** — `PATCH /api/incidencias/{id}/estado`: ciclo de vida `Abierta → EnProceso → Resuelta → Cerrada`.

## Requisitos previos

- .NET SDK (la versión indicada en `Bradson.Api.csproj`, `<TargetFramework>`)
- SQL Server (LocalDB, Express o una instancia completa administrada con SQL Server Management Studio)
- Herramienta `dotnet-ef`: `dotnet tool install --global dotnet-ef`

## Configuración de la base de datos
Con autenticación de SQL Server (usuario y contraseña):
```
ConnectionStrings__BradsonDB="Server=localhost,1433;Database=Bradson.Api;User Id=TU_USUARIO;Password=TU_PASSWORD;TrustServerCertificate=True;"
```

Con autenticación de Windows (sin usuario/contraseña):
```
ConnectionStrings__BradsonDB="Server=localhost;Database=Bradson.Api;Trusted_Connection=True;TrustServerCertificate=True;"
```

## Crear la base de datos

```
dotnet ef database update
```
Crea la base `Bradson.Api` y las 8 tablas a partir de las migraciones en `/Migrations`.
El script DDL puro (sin necesidad de EF) está en `/Database/schema.sql`.

## Documentación técnica de la API

Al correr `dotnet run`:
- Documento OpenAPI (JSON crudo): `https://localhost:{puerto}/openapi/v1.json`
- Documentación interactiva (Scalar): `https://localhost:{puerto}/scalar/v1`

## Ejecutar la API

```
dotnet run
```

## Nota sobre pagos en línea

El flujo de pago se simula en `PATCH /api/pagos/{id}/procesar`, generando referencia y código de respuesta con formato realista en `DetallePago`.

## Autor

Davinson Mesa