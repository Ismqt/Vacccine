-- =============================================
-- Author:      Cascade
-- Create date: 2024-06-14
-- Description: Adds a new availability slot for a vaccination center.
-- =============================================
-- Description: Adds a new availability slot for a vaccination center. Robust against regional date/time settings.
-- =============================================
ALTER PROCEDURE usp_AddAvailability
    @id_CentroVacunacion INT,
    @Fecha VARCHAR(10),       -- Expects YYYY-MM-DD
    @HoraInicio VARCHAR(8),   -- Expects HH:MI:SS
    @HoraFin VARCHAR(8),      -- Expects HH:MI:SS
    @CuposTotales INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ConvertedFecha DATE;
    DECLARE @ConvertedHoraInicio TIME;
    DECLARE @ConvertedHoraFin TIME;

    BEGIN TRY
        -- Use culture-invariant style codes for conversion
        -- Style 23: YYYY-MM-DD
        -- Style 108: HH:MI:SS
        SET @ConvertedFecha = CONVERT(DATE, @Fecha, 23);
        SET @ConvertedHoraInicio = CONVERT(TIME, @HoraInicio, 108);
        SET @ConvertedHoraFin = CONVERT(TIME, @HoraFin, 108);
    END TRY
    BEGIN CATCH
        -- If conversion fails, throw a specific error to the client
        THROW 50001, 'Invalid date or time format. Please use YYYY-MM-DD and HH:MI:SS.', 1;
        RETURN;
    END CATCH

    -- Insert the safely converted values
    INSERT INTO dbo.DisponibilidadHoraria (id_CentroVacunacion, Fecha, HoraInicio, HoraFin, CuposTotales, CuposDisponibles)
    VALUES (@id_CentroVacunacion, @ConvertedFecha, @ConvertedHoraInicio, @ConvertedHoraFin, @CuposTotales, @CuposTotales);
END
GO
