CREATE OR ALTER PROCEDURE usp_UpdateNino
    @id_Nino INT,
    @Nombres NVARCHAR(100),
    @Apellidos NVARCHAR(100),
    @FechaNacimiento DATE,
    @Genero CHAR(1),
    @CodigoIdentificacionPropio NVARCHAR(20),
    @id_CentroSaludAsignado INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Nino
    SET
        Nombres = @Nombres,
        Apellidos = @Apellidos,
        FechaNacimiento = @FechaNacimiento,
        Genero = @Genero,
        CodigoIdentificacionPropio = @CodigoIdentificacionPropio,
        id_CentroSaludAsignado = @id_CentroSaludAsignado
    WHERE
        id_Nino = @id_Nino;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Child not found or no data changed.', 16, 1);
        RETURN;
    END
END
GO
