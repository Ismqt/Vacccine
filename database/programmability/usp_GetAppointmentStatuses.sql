-- =============================================
-- Author:      Cascade
-- Create date: 2025-06-15
-- Description: Gets all possible appointment statuses from the lookup table.
-- =============================================
CREATE OR ALTER PROCEDURE usp_GetAppointmentStatuses
AS
BEGIN
    SET NOCOUNT ON;

    -- Assuming 'EstadosCita' is the lookup table for appointment statuses
    SELECT
        id_EstadoCita,
        NombreEstado
    FROM
        dbo.EstadosCita
    ORDER BY
        id_EstadoCita;
END
GO
