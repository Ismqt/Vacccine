CREATE TABLE dbo.DisponibilidadHoraria (
    id_Disponibilidad INT IDENTITY(1,1) PRIMARY KEY,
    id_CentroVacunacion INT NOT NULL,
    Fecha DATE NOT NULL,
    HoraInicio TIME NOT NULL,
    HoraFin TIME NOT NULL,
    CuposTotales INT NOT NULL,
    CuposDisponibles INT NOT NULL,
    CONSTRAINT FK_Disponibilidad_CentroVacunacion FOREIGN KEY (id_CentroVacunacion) REFERENCES dbo.CentroVacunacion(id_CentroVacunacion)
);
GO
