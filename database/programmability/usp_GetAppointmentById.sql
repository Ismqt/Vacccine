CREATE OR ALTER PROCEDURE usp_GetAppointmentById
    @id_Cita INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.id_Cita,
        c.id_Nino,
        c.id_Vacuna,
        c.id_CentroVacunacion,
        c.Fecha,
        c.Hora,
        c.id_EstadoCita,
        n.Nombres + ' ' + n.Apellidos AS NombreNino,
        v.Nombre AS NombreVacuna,
        cv.NombreCentro,
        ec.Estado AS EstadoCita
    FROM
        CitaVacunacion c
    JOIN Nino n ON c.id_Nino = n.id_Nino
    JOIN Vacuna v ON c.id_Vacuna = v.id_Vacuna
    JOIN CentroVacunacion cv ON c.id_CentroVacunacion = cv.id_CentroVacunacion
    JOIN EstadoCita ec ON c.id_EstadoCita = ec.id_Estado
    WHERE
        c.id_Cita = @id_Cita;
END
GO
