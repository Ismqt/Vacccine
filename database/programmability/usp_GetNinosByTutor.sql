PRINT 'Creating Stored Procedure usp_GetNinosByTutor...';
GO

IF OBJECT_ID('dbo.usp_GetNinosByTutor', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.usp_GetNinosByTutor;
END
GO

CREATE PROCEDURE dbo.usp_GetNinosByTutor
    @id_Tutor INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate Tutor exists
    IF NOT EXISTS (SELECT 1 FROM dbo.Tutor WHERE id_Tutor = @id_Tutor)
    BEGIN
        PRINT 'Error: Tutor with ID ' + CAST(@id_Tutor AS VARCHAR(10)) + ' not found.';
        -- Return an empty result set
        RETURN;
    END

    SELECT 
        n.id_Nino,
        n.Nombres AS NinoNombres,
        n.Apellidos AS NinoApellidos,
        n.FechaNacimiento,
        dbo.fn_CalculateAge(n.FechaNacimiento, GETDATE()) AS EdadActual,
        n.Genero AS NinoGenero,
        n.CodigoIdentificacionPropio AS NinoCodigoIdentificacion,
        u_nino.Email AS NinoEmail -- Child's own user account email, if any
    FROM 
        dbo.Nino n
    JOIN 
        dbo.TutorNino tn ON n.id_Nino = tn.id_Nino
    LEFT JOIN
        dbo.Usuario u_nino ON n.id_Usuario = u_nino.id_Usuario -- Left join for child's optional user account
    WHERE 
        tn.id_Tutor = @id_Tutor
    ORDER BY
        n.Apellidos, n.Nombres; -- Optional: order the results

END;
GO

PRINT 'Stored Procedure usp_GetNinosByTutor created/updated successfully.';
GO

-- Example Usage:
/*
-- Assuming a Tutor with ID 1 exists and has linked children:
EXEC dbo.usp_GetNinosByTutor @id_Tutor = 1;

-- Assuming a Tutor with ID 999 does not exist or has no children:
EXEC dbo.usp_GetNinosByTutor @id_Tutor = 999;
*/
GO
