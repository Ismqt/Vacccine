CREATE OR ALTER PROCEDURE usp_GetDashboardStats
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        (SELECT COUNT(*) FROM Usuario) AS TotalUsers,
        (SELECT COUNT(*) FROM Vacuna) AS TotalVaccines,
        (SELECT COUNT(*) FROM CentroVacunacion) AS TotalCenters,
        (SELECT COUNT(*) FROM CitaVacunacion WHERE id_EstadoCita = (SELECT id_Estado FROM EstadoCita WHERE Estado = 'Programada')) AS TotalScheduledAppointments;
END
GO
