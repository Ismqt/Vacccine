CREATE OR ALTER PROCEDURE usp_UpdateAppointment
    @id_Cita INT,
    @id_Vacuna INT,
    @id_CentroVacunacion INT,
    @Fecha DATE,
    @Hora TIME,
    @id_EstadoCita INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE CitaVacunacion
    SET
        id_Vacuna = @id_Vacuna,
        id_CentroVacunacion = @id_CentroVacunacion,
        Fecha = @Fecha,
        Hora = @Hora,
        id_EstadoCita = @id_EstadoCita
    WHERE
        id_Cita = @id_Cita;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Appointment not found or no data changed.', 16, 1);
        RETURN;
    END
END
GO
