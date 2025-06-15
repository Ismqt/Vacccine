-- =============================================
-- Author:      Cascade
-- Create date: 2025-06-15
-- Description: Gets all availability slots from all centers for administrators.
-- =============================================
CREATE OR ALTER PROCEDURE usp_GetAvailabilityForAdmin
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        d.*, 
        c.NombreCentro AS NombreCentro 
    FROM 
        dbo.DisponibilidadHoraria d
    JOIN 
        dbo.CentroVacunacion c ON d.id_CentroVacunacion = c.id_CentroVacunacion 
    ORDER BY 
        d.Fecha, d.HoraInicio;
END
GO
