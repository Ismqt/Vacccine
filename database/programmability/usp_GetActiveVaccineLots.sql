PRINT 'Creating Stored Procedure usp_GetActiveVaccineLots...';
GO

IF OBJECT_ID('dbo.usp_GetActiveVaccineLots', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.usp_GetActiveVaccineLots;
END
GO

CREATE PROCEDURE dbo.usp_GetActiveVaccineLots
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        l.id_LoteVacuna,
        l.NumeroLote,
        v.Nombre AS NombreVacuna,
        f.Fabricante AS NombreFabricante,
        l.FechaCaducidad,
        l.CantidadDisponible
    FROM 
        dbo.Lote l
    JOIN 
        dbo.Vacuna v ON l.id_VacunaCatalogo = v.id_Vacuna
    JOIN 
        dbo.Fabricante f ON v.id_Fabricante = f.id_Fabricante
    WHERE 
        l.CantidadDisponible > 0
        AND l.FechaCaducidad >= CAST(GETDATE() AS DATE) -- Compare with date part only to include lots expiring today
    ORDER BY
        v.Nombre, l.FechaCaducidad;

END;
GO

PRINT 'Stored Procedure usp_GetActiveVaccineLots created/updated successfully.';
GO

-- Example Usage:
/*
EXEC dbo.usp_GetActiveVaccineLots;
*/
GO
