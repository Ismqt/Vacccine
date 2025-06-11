CREATE OR ALTER PROCEDURE usp_DeleteAppointment
    @id_Cita INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM CitaVacunacion WHERE id_Cita = @id_Cita AND id_EstadoCita = (SELECT id_Estado FROM EstadoCita WHERE Estado = 'Programada'))
    BEGIN
        RAISERROR('Cannot delete appointment. It is not in a scheduled state.', 16, 1);
        RETURN;
    END

    DELETE FROM CitaVacunacion
    WHERE id_Cita = @id_Cita;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Appointment not found.', 16, 1);
        RETURN;
    END
END
GO
