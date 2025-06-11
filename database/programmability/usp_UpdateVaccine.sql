CREATE OR ALTER PROCEDURE usp_UpdateVaccine
    @id_Vacuna INT,
    @id_Fabricante INT,
    @Nombre NVARCHAR(100),
    @DosisLimite INT,
    @Tipo NVARCHAR(50),
    @Descripcion NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Vacuna
    SET
        id_Fabricante = @id_Fabricante,
        Nombre = @Nombre,
        DosisLimite = @DosisLimite,
        Tipo = @Tipo,
        Descripcion = @Descripcion
    WHERE
        id_Vacuna = @id_Vacuna;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Vaccine not found or no data changed.', 16, 1);
        RETURN;
    END
END
GO
