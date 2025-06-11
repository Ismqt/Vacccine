CREATE OR ALTER PROCEDURE usp_DeleteNino
    @id_Nino INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Safety Check: Do not delete a child if they have vaccination history records.
    IF EXISTS (SELECT 1 FROM HistoricoVacunas WHERE id_Nino = @id_Nino)
    BEGIN
        RAISERROR('Cannot delete child. This child has an existing vaccination history.', 16, 1);
        RETURN;
    END

    -- Note: Deletions will cascade to CitaVacunacion and TutorNino tables based on schema rules.
    DELETE FROM Nino
    WHERE id_Nino = @id_Nino;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Child not found.', 16, 1);
        RETURN;
    END
END
GO
