CREATE OR ALTER PROCEDURE dbo.usp_GetAllAppointments
    @id_Usuario INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.id_Cita,
        c.Fecha AS Fecha,
        c.Hora AS Hora,
        -- If id_Nino is not null, get child's name. Otherwise, get the user's name from the Tutor table.
        COALESCE(n.Nombres + ' ' + n.Apellidos, t_self.Nombres + ' ' + t_self.Apellidos) AS NombrePaciente,
        v.Nombre AS NombreVacuna,
        cv.NombreCentro,
        ec.Estado AS EstadoCita
    FROM
        dbo.CitaVacunacion c
    -- Join to get child's name if applicable
    LEFT JOIN dbo.Nino n ON c.id_Nino = n.id_Nino
    -- Join to get the name of the user who booked the appointment (assuming they are a tutor)
    LEFT JOIN dbo.Tutor t_self ON c.id_UsuarioRegistraCita = t_self.id_Usuario
    -- Joins for filtering by the logged-in tutor for their children's appointments
    LEFT JOIN dbo.TutorNino tn ON n.id_Nino = tn.id_Nino
    LEFT JOIN dbo.Tutor t_filter ON tn.id_Tutor = t_filter.id_Tutor
    -- Other necessary joins
    JOIN dbo.Vacuna v ON c.id_Vacuna = v.id_Vacuna
    JOIN dbo.CentroVacunacion cv ON c.id_CentroVacunacion = cv.id_CentroVacunacion
    JOIN dbo.EstadoCita ec ON c.id_EstadoCita = ec.id_Estado
    WHERE
        -- Admin/Medico case: @id_Usuario is NULL, so return all appointments
        @id_Usuario IS NULL OR
        -- Tutor case 1: Appointment is for a child linked to the tutor
        t_filter.id_Usuario = @id_Usuario OR
        -- Tutor case 2: Appointment is for the tutor themselves
        (c.id_Nino IS NULL AND c.id_UsuarioRegistraCita = @id_Usuario)
    ORDER BY
        c.Fecha DESC, c.Hora DESC;
END
GO
