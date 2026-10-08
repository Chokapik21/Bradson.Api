IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Servicios] (
    [Id] int NOT NULL IDENTITY,
    [NombreCategoria] nvarchar(100) NOT NULL,
    [Descripcion] text NOT NULL,
    [TarifaBase] decimal(10,2) NOT NULL,
    CONSTRAINT [PK_Servicios] PRIMARY KEY ([Id])
);

CREATE TABLE [Usuarios] (
    [Id] int NOT NULL IDENTITY,
    [Nombre] nvarchar(150) NOT NULL,
    [Documento] nvarchar(20) NOT NULL,
    [Correo] nvarchar(150) NOT NULL,
    [ContrasenaHash] nvarchar(255) NOT NULL,
    [FotoPerfil] nvarchar(255) NULL,
    [Telefono] nvarchar(20) NOT NULL,
    [EstadoCuenta] nvarchar(20) NOT NULL,
    [Verificado] bit NOT NULL,
    [Rol] nvarchar(20) NOT NULL,
    [Latitud] decimal(9,6) NULL,
    [Longitud] decimal(9,6) NULL,
    CONSTRAINT [PK_Usuarios] PRIMARY KEY ([Id])
);

CREATE TABLE [Disponibilidades] (
    [Id] int NOT NULL IDENTITY,
    [DiaSemana] nvarchar(15) NOT NULL,
    [HoraInicio] time NOT NULL,
    [HoraFin] time NOT NULL,
    [IdTrabajador] int NOT NULL,
    CONSTRAINT [PK_Disponibilidades] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Disponibilidades_Usuarios_IdTrabajador] FOREIGN KEY ([IdTrabajador]) REFERENCES [Usuarios] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Reservas] (
    [Id] int NOT NULL IDENTITY,
    [Fecha] date NOT NULL,
    [Hora] time NOT NULL,
    [Latitud] decimal(9,6) NOT NULL,
    [Longitud] decimal(9,6) NOT NULL,
    [Estado] nvarchar(20) NOT NULL,
    [PrecioTotal] decimal(10,2) NOT NULL,
    [Direccion] nvarchar(255) NOT NULL,
    [Referencia] nvarchar(255) NULL,
    [IdCliente] int NOT NULL,
    [IdTrabajador] int NOT NULL,
    [IdServicio] int NOT NULL,
    CONSTRAINT [PK_Reservas] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Reservas_Servicios_IdServicio] FOREIGN KEY ([IdServicio]) REFERENCES [Servicios] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Reservas_Usuarios_IdCliente] FOREIGN KEY ([IdCliente]) REFERENCES [Usuarios] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Reservas_Usuarios_IdTrabajador] FOREIGN KEY ([IdTrabajador]) REFERENCES [Usuarios] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Calificaciones] (
    [Id] int NOT NULL IDENTITY,
    [Puntuacion] tinyint NOT NULL,
    [Comentario] nvarchar(255) NULL,
    [FechaRegistro] date NOT NULL,
    [IdReserva] int NOT NULL,
    CONSTRAINT [PK_Calificaciones] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Calificacion_Puntuacion] CHECK (Puntuacion BETWEEN 1 AND 5),
    CONSTRAINT [FK_Calificaciones_Reservas_IdReserva] FOREIGN KEY ([IdReserva]) REFERENCES [Reservas] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Incidencias] (
    [Id] int NOT NULL IDENTITY,
    [TipoNovedad] nvarchar(100) NOT NULL,
    [Descripcion] text NOT NULL,
    [EstadoSolucion] nvarchar(20) NOT NULL,
    [IdReserva] int NOT NULL,
    CONSTRAINT [PK_Incidencias] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Incidencias_Reservas_IdReserva] FOREIGN KEY ([IdReserva]) REFERENCES [Reservas] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Pagos] (
    [Id] int NOT NULL IDENTITY,
    [MontoBruto] decimal(10,2) NOT NULL,
    [ComisionApp] decimal(10,2) NOT NULL,
    [MontoNeto] decimal(10,2) NOT NULL,
    [MetodoPago] nvarchar(20) NOT NULL,
    [EstadoPago] nvarchar(20) NOT NULL,
    [FechaPago] datetime2 NULL,
    [IdReserva] int NOT NULL,
    CONSTRAINT [PK_Pagos] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Pagos_Reservas_IdReserva] FOREIGN KEY ([IdReserva]) REFERENCES [Reservas] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [DetallesPago] (
    [Id] int NOT NULL IDENTITY,
    [Pasarela] nvarchar(50) NOT NULL,
    [ReferenciaTransaccion] nvarchar(100) NOT NULL,
    [TokenTransaccion] nvarchar(255) NULL,
    [CodigoRespuesta] nvarchar(20) NULL,
    [FechaRespuesta] datetime2 NOT NULL,
    [IdPago] int NOT NULL,
    CONSTRAINT [PK_DetallesPago] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_DetallesPago_Pagos_IdPago] FOREIGN KEY ([IdPago]) REFERENCES [Pagos] ([Id]) ON DELETE CASCADE
);

CREATE UNIQUE INDEX [IX_Calificaciones_IdReserva] ON [Calificaciones] ([IdReserva]);

CREATE UNIQUE INDEX [IX_DetallesPago_IdPago] ON [DetallesPago] ([IdPago]);

CREATE INDEX [IX_Disponibilidades_IdTrabajador] ON [Disponibilidades] ([IdTrabajador]);

CREATE INDEX [IX_Incidencias_IdReserva] ON [Incidencias] ([IdReserva]);

CREATE UNIQUE INDEX [IX_Pagos_IdReserva] ON [Pagos] ([IdReserva]);

CREATE INDEX [IX_Reservas_IdCliente] ON [Reservas] ([IdCliente]);

CREATE INDEX [IX_Reservas_IdServicio] ON [Reservas] ([IdServicio]);

CREATE INDEX [IX_Reservas_IdTrabajador] ON [Reservas] ([IdTrabajador]);

CREATE UNIQUE INDEX [IX_Usuarios_Correo] ON [Usuarios] ([Correo]);

CREATE UNIQUE INDEX [IX_Usuarios_Documento] ON [Usuarios] ([Documento]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261008031002_InitialBradsonDba', N'9.0.0');

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261008183656_updateBradsonDba', N'9.0.0');

COMMIT;
GO

