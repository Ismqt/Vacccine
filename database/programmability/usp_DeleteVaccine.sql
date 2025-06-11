CREATE OR ALTER PROCEDURE usp_DeleteVaccine
    @id_Vacuna INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the vaccine is used in any lots or appointments before deleting
    IF EXISTS (SELECT 1 FROM Lote WHERE id_VacunaCatalogo = @id_Vacuna) OR EXISTS (SELECT 1 FROM CitaVacunacion WHERE id_Vacuna = @id_Vacuna)
    BEGIN
        RAISERROR('Cannot delete vaccine. It is currently associated with active lots or appointments.', 16, 1);
        RETURN;
    END

    DELETE FROM Vacuna
    WHERE id_Vacuna = @id_Vacuna;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Vaccine not found.', 16, 1);
        RETURN;
    END
END
GO
