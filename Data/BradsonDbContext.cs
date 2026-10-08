using Microsoft.EntityFrameworkCore;
using Bradson.Api.Models;

namespace Bradson.Api.Data
{
    public class BradsonDbContext : DbContext
    {
        // Constructor para pasar la configuración de conexión desde Program.cs
        public BradsonDbContext(DbContextOptions<BradsonDbContext> options) : base(options)
        {
        }

        // Tablas que Entity Framework gestionará en SQL Server / PostgreSQL
        public DbSet<ClsUsuario> Usuarios { get; set; }
        public DbSet<ClsServicio> Servicios { get; set; }
        public DbSet<ClsReserva> Reservas { get; set; }
        public DbSet<ClsPago> Pagos { get; set; }
        public DbSet<ClsDetallePago> DetallesPago { get; set; }
        public DbSet<ClsCalificacion> Calificaciones { get; set; }
        public DbSet<ClsIncidencia> Incidencias { get; set; }
        public DbSet<ClsDisponibilidad> Disponibilidades { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //Usuario
            modelBuilder.Entity<ClsUsuario>(e =>
            {
                e.HasIndex(u => u.Correo).IsUnique();
                e.HasIndex(u => u.Documento).IsUnique();
                e.Property(u => u.Rol).HasConversion<string>().HasMaxLength(20);
                e.Property(u => u.EstadoCuenta).HasMaxLength(20);
            });

            //Reserva: las dos FKs hacia Usuario
            modelBuilder.Entity<ClsReserva>(e =>
            {
                e.HasOne(r => r.Cliente)
                 .WithMany(u => u.ReservasComoCliente)
                 .HasForeignKey(r => r.IdCliente)
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(r => r.Trabajador)
                 .WithMany(u => u.ReservasComoTrabajador)
                 .HasForeignKey(r => r.IdTrabajador)
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(r => r.Servicio)
                 .WithMany(s => s.Reservas)
                 .HasForeignKey(r => r.IdServicio)
                 .OnDelete(DeleteBehavior.Restrict);

                e.Property(r => r.Estado).HasConversion<string>().HasMaxLength(20);
            });

            //Pago (1 a 1 con Reserva)
            modelBuilder.Entity<ClsPago>(e =>
            {
                e.HasOne(p => p.Reserva)
                 .WithOne(r => r.Pago)
                 .HasForeignKey<ClsPago>(p => p.IdReserva)
                 .OnDelete(DeleteBehavior.Cascade);

                e.Property(p => p.MetodoPago).HasConversion<string>().HasMaxLength(20);
                e.Property(p => p.EstadoPago).HasConversion<string>().HasMaxLength(20);
            });

            //DetallePago (1 a 1 con Pago)
            modelBuilder.Entity<ClsDetallePago>(e =>
            {
                e.HasOne(d => d.Pago)
                 .WithOne(p => p.DetallePago)
                 .HasForeignKey<ClsDetallePago>(d => d.IdPago)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            //Calificacion (1 a 1 con Reserva)
            modelBuilder.Entity<ClsCalificacion>(e =>
            {
                e.HasOne(c => c.Reserva)
                 .WithOne(r => r.Calificacion)
                 .HasForeignKey<ClsCalificacion>(c => c.IdReserva)
                 .OnDelete(DeleteBehavior.Cascade);

                e.ToTable(t => t.HasCheckConstraint("CK_Calificacion_Puntuacion", "Puntuacion BETWEEN 1 AND 5"));
            });

            //Incidencia (1 a muchas con Reserva)
            modelBuilder.Entity<ClsIncidencia>(e =>
            {
                e.HasOne(i => i.Reserva)
                 .WithMany(r => r.Incidencias)
                 .HasForeignKey(i => i.IdReserva)
                 .OnDelete(DeleteBehavior.Cascade);

                e.Property(i => i.EstadoSolucion).HasConversion<string>().HasMaxLength(20);
            });

            //Disponibilidad (1 a muchas con Usuario)
            modelBuilder.Entity<ClsDisponibilidad>(e =>
            {
                e.HasOne(d => d.Trabajador)
                 .WithMany(u => u.Disponibilidades)
                 .HasForeignKey(d => d.IdTrabajador)
                 .OnDelete(DeleteBehavior.Cascade);

                e.Property(d => d.DiaSemana).HasConversion<string>().HasMaxLength(15);
            });
        }
    }
}