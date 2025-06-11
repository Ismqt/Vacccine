PRINT 'Creating Stored Procedure usp_RecordVaccination...';
GO

IF OBJECT_ID('dbo.usp_RecordVaccination', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.usp_RecordVaccination;
END
GO

CREATE PROCEDURE dbo.usp_RecordVaccination
    @id_Cita INT,
    @id_PersonalSalud_Usuario INT, -- User ID of the logged-in health personnel
    @id_LoteAplicado INT,
    @NombreCompletoPersonalAplicado NVARCHAR(100), -- Name of person who physically administered, could be different
    @DosisAplicada NVARCHAR(50), -- e.g., '1st Dose', '2nd Dose', 'Booster'
    @EdadAlMomento NVARCHAR(20), -- e.g., '2 años, 3 meses'
    @NotasAdicionales NVARCHAR(MAX) = NULL,
    @Alergias NVARCHAR(MAX) = NULL,

    @OutputMessage NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_EstadoCita_Asistida INT;
    DECLARE @id_Nino INT;
    DECLARE @id_Vacuna INT;
    DECLARE @VacunaNombre NVARCHAR(100);
    DECLARE @FabricanteNombre NVARCHAR(100);
    DECLARE @LoteNumero NVARCHAR(50);
    DECLARE @FechaAplicacion DATE;

    -- Get ID for 'Asistida' state
    SELECT @id_EstadoCita_Asistida = id_Estado FROM dbo.EstadoCita WHERE Estado = 'Asistida';
    IF @id_EstadoCita_Asistida IS NULL
    BEGIN
        SET @OutputMessage = 'Error: Appointment state ''Asistida'' not found. Please ensure initial data is populated.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    -- Validate Cita exists and is in a schedulable state (e.g., 'Agendada' or 'Confirmada')
    SELECT @id_Nino = c.id_Nino, @id_Vacuna = c.id_Vacuna, @FechaAplicacion = c.Fecha
    FROM dbo.CitaVacunacion c
    JOIN dbo.EstadoCita ec ON c.id_EstadoCita = ec.id_Estado
    WHERE c.id_Cita = @id_Cita AND ec.Estado IN ('Agendada', 'Confirmada');

    IF @id_Nino IS NULL
    BEGIN
        SET @OutputMessage = 'Error: Valid Appointment ID not found or appointment is not in a state that can be marked as attended.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    -- Validate PersonalSalud_Usuario exists
    IF NOT EXISTS (SELECT 1 FROM dbo.Usuario WHERE id_Usuario = @id_PersonalSalud_Usuario)
    BEGIN
        SET @OutputMessage = 'Error: Specified Health Personnel User ID does not exist.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    -- Validate LoteAplicado exists and has quantity
    SELECT @LoteNumero = l.NumeroLote, @VacunaNombre = v.Nombre, @FabricanteNombre = f.Fabricante
    FROM dbo.Lote l
    JOIN dbo.Vacuna v ON l.id_VacunaCatalogo = v.id_Vacuna
    JOIN dbo.Fabricante f ON v.id_Fabricante = f.id_Fabricante
    WHERE l.id_LoteVacuna = @id_LoteAplicado;

    IF @LoteNumero IS NULL
    BEGIN
        SET @OutputMessage = 'Error: Specified Vaccine Lot ID does not exist.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    IF (SELECT CantidadDisponible FROM dbo.Lote WHERE id_LoteVacuna = @id_LoteAplicado) <= 0
    BEGIN
        SET @OutputMessage = 'Error: No available quantity in the specified Vaccine Lot.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    BEGIN TRY
        -- Update CitaVacunacion
        UPDATE dbo.CitaVacunacion
        SET id_EstadoCita = @id_EstadoCita_Asistida,
            id_PersonalSalud = @id_PersonalSalud_Usuario,
            id_LoteAplicado = @id_LoteAplicado,
            NombreCompletoPersonalAplicado = @NombreCompletoPersonalAplicado
        WHERE id_Cita = @id_Cita;

        -- Decrement Lote quantity
        UPDATE dbo.Lote
        SET CantidadDisponible = CantidadDisponible - 1
        WHERE id_LoteVacuna = @id_LoteAplicado;

        -- Insert into HistoricoVacunas
        INSERT INTO dbo.HistoricoVacunas (
            id_Nino, id_Cita, FechaAplicacion, DosisAplicada, EdadAlMomento, 
            VacunaNombre, FabricanteNombre, LoteNumero, PersonalSaludNombre, 
            NotasAdicionales, Alergias
        )
        VALUES (
            @id_Nino, @id_Cita, @FechaAplicacion, @DosisAplicada, @EdadAlMomento,
            @VacunaNombre, @FabricanteNombre, @LoteNumero, @NombreCompletoPersonalAplicado,
            @NotasAdicionales, @Alergias
        );

        COMMIT TRANSACTION;
        SET @OutputMessage = 'Vaccination recorded successfully for Appointment ID: ' + CAST(@id_Cita AS NVARCHAR(10)) + '.';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        SET @OutputMessage = 'Error recording vaccination: ' + ERROR_MESSAGE() + ' (Procedure: ' + ERROR_PROCEDURE() + ', Line: ' + CAST(ERROR_LINE() AS NVARCHAR(10)) + ')';
        THROW;
        RETURN;
    END CATCH
END;
GO

PRINT 'Stored Procedure usp_RecordVaccination created/updated successfully.';
GO
