CREATE OR ALTER PROCEDURE usp_DeleteVaccinationCenter
    @id_CentroVacunacion INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check for dependencies before deleting
    IF EXISTS (SELECT 1 FROM CitaVacunacion WHERE id_CentroVacunacion = @id_CentroVacunacion) OR EXISTS (SELECT 1 FROM Nino WHERE id_CentroSaludAsignado = @id_CentroVacunacion)
    BEGIN
        RAISERROR('Cannot delete center. It is referenced by existing appointments or children.', 16, 1);
        RETURN;
    END

    DELETE FROM CentroVacunacion
    WHERE id_CentroVacunacion = @id_CentroVacunacion;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Vaccination Center not found.', 16, 1);
        RETURN;
    END
END
GO
