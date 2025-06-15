-- =============================================
-- Author:      Cascade
-- Create date: 2025-06-15
-- Description: Gets all availability slots for a specific vaccination center.
-- =============================================
CREATE OR ALTER PROCEDURE usp_GetAvailabilityForCenter
    @id_CentroVacunacion INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        id_Disponibilidad,
        id_CentroVacunacion,
        Fecha,
        HoraInicio,
        HoraFin,
        CuposTotales,
        CuposDisponibles
    FROM
        dbo.DisponibilidadHoraria
    WHERE
        id_CentroVacunacion = @id_CentroVacunacion
    ORDER BY
        Fecha, HoraInicio;
END
GO
