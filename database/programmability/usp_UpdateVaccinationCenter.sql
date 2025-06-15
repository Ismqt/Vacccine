SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[usp_UpdateVaccinationCenter]
    @id_CentroVacunacion INT,
    @NombreCentro NVARCHAR(100),
    @Direccion NVARCHAR(200),
    @id_Provincia INT,
    @id_Municipio INT,
    @Telefono NVARCHAR(20),
    @Director NVARCHAR(100),
    @Web NVARCHAR(100),
    @Capacidad INT,
    @id_Estado INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE CentroVacunacion
    SET
        NombreCentro = @NombreCentro,
        Direccion = @Direccion,
        id_Provincia = @id_Provincia,
        id_Municipio = @id_Municipio,
        Telefono = @Telefono,
        Director = @Director,
        Web = @Web,
        Capacidad = @Capacidad,
        id_Estado = @id_Estado
    WHERE
        id_CentroVacunacion = @id_CentroVacunacion;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Vaccination Center not found or no data changed.', 16, 1);
        RETURN;
    END
END
GO
