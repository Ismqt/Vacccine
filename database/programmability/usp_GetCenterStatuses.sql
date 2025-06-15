-- =============================================
-- Description: Retrieves all possible statuses for a vaccination center.
-- =============================================
CREATE OR ALTER PROCEDURE usp_GetCenterStatuses
AS
BEGIN
    SET NOCOUNT ON;

    -- The frontend expects id_Estado and NombreEstado.
    -- The table EstadosCentro has id_Estado and NombreEstado.
    -- This SP selects the correct columns to match the frontend's data model.
    SELECT
        id_Estado,
        NombreEstado
    FROM
        EstadosCentro;
END
GO
