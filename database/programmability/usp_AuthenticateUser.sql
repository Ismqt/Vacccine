-- Drop the old procedure if it exists
IF OBJECT_ID('usp_AuthenticateUser', 'P') IS NOT NULL
    DROP PROCEDURE usp_AuthenticateUser;
GO

-- Create or alter the new procedure for fetching user data for authentication
CREATE OR ALTER PROCEDURE usp_GetUserForAuth
    @LoginIdentifier NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    -- Selects user information, including the hashed password (Clave),
    -- for authentication in the application layer.
    SELECT 
        u.id_Usuario,
        u.Email,
        u.Cedula_Usuario,
        u.Clave, -- Hashed password
        u.id_Rol,
        r.Rol AS NombreRol,
        u.id_Estado AS id_EstadoUsuario,
        es.Estado AS NombreEstado
    FROM 
        Usuario u
    INNER JOIN 
        Rol r ON u.id_Rol = r.id_Rol
    INNER JOIN
        EstadoUsuario es ON u.id_Estado = es.id_Estado
    WHERE 
        (u.Email = @LoginIdentifier OR u.Cedula_Usuario = @LoginIdentifier)
        AND u.id_Estado = 1; -- Ensure user is active (1 = 'Activo')

END;
GO
