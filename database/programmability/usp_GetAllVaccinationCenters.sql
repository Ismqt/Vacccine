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
