CREATE OR ALTER PROCEDURE usp_GetVaccineById
    @id_Vacuna INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        v.id_Vacuna,
        v.id_Fabricante,
        f.Fabricante AS NombreFabricante,
        v.Nombre,
        v.DosisLimite,
        v.Tipo,
        v.Descripcion
    FROM
        Vacuna v
    INNER JOIN
        Fabricante f ON v.id_Fabricante = f.id_Fabricante
    WHERE
        v.id_Vacuna = @id_Vacuna;
END
GO
