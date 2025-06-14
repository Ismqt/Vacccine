IF OBJECT_ID('usp_GetAllVaccinationCenters', 'P') IS NOT NULL
    DROP PROCEDURE usp_GetAllVaccinationCenters;
GO

CREATE PROCEDURE usp_GetAllVaccinationCenters
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        id_CentroVacunacion,
        NombreCentro,
        NombreCorto,
        Direccion,
        Telefono,
        Director,
        Web
    FROM 
        CentroVacunacion;

END;
GO

PRINT 'Stored procedure usp_GetAllVaccinationCenters created/updated.';
GO
