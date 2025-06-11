CREATE OR ALTER PROCEDURE usp_GetAllUsers
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.id_Usuario,
        u.Cedula_Usuario,
        u.Email,
        u.id_Rol,
        r.Rol AS NombreRol,
        u.id_Estado,
        es.Estado AS NombreEstado
    FROM
        Usuario u
    INNER JOIN
        Rol r ON u.id_Rol = r.id_Rol
    INNER JOIN
        EstadoUsuario es ON u.id_Estado = es.id_Estado
    ORDER BY
        u.id_Usuario;
END
GO
