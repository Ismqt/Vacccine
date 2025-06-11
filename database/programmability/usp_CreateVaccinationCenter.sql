CREATE OR ALTER PROCEDURE usp_CreateVaccinationCenter
    @NombreCentro NVARCHAR(100),
    @NombreCorto NVARCHAR(50),
    @Direccion NVARCHAR(200),
    @Telefono NVARCHAR(20),
    @Director NVARCHAR(100),
    @Web NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO CentroVacunacion (NombreCentro, NombreCorto, Direccion, Telefono, Director, Web)
    VALUES (@NombreCentro, @NombreCorto, @Direccion, @Telefono, @Director, @Web);

    SELECT SCOPE_IDENTITY() AS id_CentroVacunacion;
END
GO
