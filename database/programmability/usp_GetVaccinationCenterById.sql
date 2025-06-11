CREATE OR ALTER PROCEDURE usp_GetVaccinationCenterById
    @id_CentroVacunacion INT
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
        CentroVacunacion
    WHERE
        id_CentroVacunacion = @id_CentroVacunacion;
END
GO
