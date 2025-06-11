CREATE PROCEDURE usp_GetAllVaccines
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        id_Vacuna,
        id_Fabricante,
        Nombre,
        DosisLimite,
        Tipo,
        Descripcion
    FROM 
        Vacuna;

END;
GO
