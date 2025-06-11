CREATE OR ALTER PROCEDURE usp_UpdateVaccinationCenter
    @id_CentroVacunacion INT,
    @NombreCentro NVARCHAR(100),
    @NombreCorto NVARCHAR(50),
    @Direccion NVARCHAR(200),
    @Telefono NVARCHAR(20),
    @Director NVARCHAR(100),
    @Web NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE CentroVacunacion
    SET
        NombreCentro = @NombreCentro,
        NombreCorto = @NombreCorto,
        Direccion = @Direccion,
        Telefono = @Telefono,
        Director = @Director,
        Web = @Web
    WHERE
        id_CentroVacunacion = @id_CentroVacunacion;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Vaccination Center not found or no data changed.', 16, 1);
        RETURN;
    END
END
GO
