-- =============================================
-- Description: Retrieves all provinces.
-- =============================================
CREATE OR ALTER PROCEDURE usp_GetProvinces
AS
BEGIN
    SET NOCOUNT ON;

    -- Selects all provinces, ordering by name.
    -- The frontend expects id_Provincia and Nombre.
    SELECT
        id_Provincia,
        Nombre
    FROM
        Provincia
    ORDER BY
        Nombre;
END
GO
