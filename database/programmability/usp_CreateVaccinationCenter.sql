SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[usp_CreateVaccinationCenter]
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

    INSERT INTO CentroVacunacion (
        NombreCentro, Direccion, Telefono, Director, Web, 
        Capacidad, id_Estado, id_Provincia, id_Municipio
    )
    VALUES (
        @NombreCentro, @Direccion, @Telefono, @Director, @Web, 
        @Capacidad, @id_Estado, @id_Provincia, @id_Municipio
    );

    SELECT SCOPE_IDENTITY() AS id_CentroVacunacion;
END
GO
