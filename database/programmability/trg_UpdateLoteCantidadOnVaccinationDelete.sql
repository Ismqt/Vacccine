PRINT 'Creating Trigger trg_UpdateLoteCantidadOnVaccinationDelete...';
GO

IF OBJECT_ID('dbo.trg_UpdateLoteCantidadOnVaccinationDelete', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER dbo.trg_UpdateLoteCantidadOnVaccinationDelete;
END
GO

CREATE TRIGGER dbo.trg_UpdateLoteCantidadOnVaccinationDelete
ON dbo.HistoricoVacunas
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if any rows were actually deleted
    IF NOT EXISTS (SELECT * FROM deleted)
    BEGIN
        RETURN;
    END

    DECLARE @id_LoteAplicado INT;
    DECLARE @rowsToUpdate INT = 0;

    -- It's possible multiple rows are deleted in one statement.
    -- We need to update Lote for each distinct id_LoteAplicado found through the deleted HistoricoVacunas records.
    -- The link is HistoricoVacunas -> CitaVacunacion -> Lote.
    -- However, HistoricoVacunas itself stores LoteNumero. If LoteNumero and VacunaNombre are reliable enough to find the Lote, 
    -- we might not need to go through CitaVacunacion if its id_Cita is NULL (though it's UNIQUE, so it shouldn't be NULL if it was linked).
    -- For robustness, let's try to get id_LoteAplicado from CitaVacunacion using the id_Cita from the deleted HistoricoVacunas record.

    -- Create a temporary table to hold the lot IDs and the count of vaccines to return to stock for each lot.
    DECLARE @LotUpdates TABLE (id_LoteVacuna INT, QuantityToReturn INT);

    INSERT INTO @LotUpdates (id_LoteVacuna, QuantityToReturn)
    SELECT cv.id_LoteAplicado, COUNT(*)
    FROM deleted d
    JOIN dbo.CitaVacunacion cv ON d.id_Cita = cv.id_Cita -- Assumes id_Cita in HistoricoVacunas is reliably linked to CitaVacunacion
    WHERE cv.id_LoteAplicado IS NOT NULL
    GROUP BY cv.id_LoteAplicado;
    
    -- If id_Cita might be NULL in HistoricoVacunas (though it's UNIQUE, so it's either linked or the record is standalone),
    -- an alternative or supplementary approach would be to use LoteNumero and VacunaNombre from the 'deleted' table
    -- to find the id_LoteVacuna, but this is less direct and assumes names/numbers haven't changed.
    -- The current approach relies on id_Cita being present and valid in the deleted HistoricoVacunas row.

    BEGIN TRY
        -- Update Lote table for each affected lot
        UPDATE l
        SET l.CantidadDisponible = l.CantidadDisponible + lu.QuantityToReturn
        FROM dbo.Lote l
        JOIN @LotUpdates lu ON l.id_LoteVacuna = lu.id_LoteVacuna;

        SET @rowsToUpdate = @@ROWCOUNT;

        IF @rowsToUpdate > 0
        BEGIN
            PRINT 'Trigger trg_UpdateLoteCantidadOnVaccinationDelete: Updated ' + CAST(@rowsToUpdate AS VARCHAR(10)) + ' lot(s) due to vaccination record deletion.';
        END

    END TRY
    BEGIN CATCH
        -- Handle potential errors during the trigger execution, e.g., log them.
        -- For simplicity, we're not re-throwing errors from triggers usually, as it can complicate the original DML operation.
        -- However, logging is crucial in a production system.
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        PRINT 'Error in trigger trg_UpdateLoteCantidadOnVaccinationDelete: ' + @ErrorMessage;
        -- Optionally, use RAISERROR if the situation warrants stopping the transaction, but be cautious.
    END CATCH
END;
GO

PRINT 'Trigger trg_UpdateLoteCantidadOnVaccinationDelete created successfully.';
GO
