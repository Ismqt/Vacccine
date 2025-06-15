-- =============================================
-- Author:      Cascade
-- Create date: 2025-06-15
-- Description: Gets all active appointments for a specific doctor.
-- =============================================
CREATE OR ALTER PROCEDURE usp_GetDoctorAppointments
    @id_Doctor INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Assuming 'Citas' is the appointments table and it links to users/patients and statuses
    SELECT
        c.id_Cita,
        c.FechaCita,
        c.HoraCita,
        u.Nombre + ' ' + u.Apellido AS NombrePaciente,
        ec.NombreEstado AS EstadoCita,
        cv.NombreCentro AS NombreCentro
    FROM
        dbo.Citas c
    JOIN
        dbo.Pacientes p ON c.id_Paciente = p.id_Paciente
    JOIN
        dbo.Usuarios u ON p.id_Usuario = u.id_Usuario
    JOIN
        dbo.EstadosCita ec ON c.id_EstadoCita = ec.id_EstadoCita
    JOIN 
        dbo.DisponibilidadHoraria dh ON c.id_Disponibilidad = dh.id_Disponibilidad
    JOIN
        dbo.CentroVacunacion cv ON dh.id_CentroVacunacion = cv.id_CentroVacunacion
    WHERE
        dh.id_Doctor = @id_Doctor -- Filter by the doctor's user ID
        AND ec.NombreEstado NOT IN ('Realizada', 'Cancelada', 'No Asistió') -- Get only pending appointments
    ORDER BY
        c.FechaCita, c.HoraCita;
END
GO
