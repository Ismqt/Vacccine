CREATE OR ALTER PROCEDURE usp_GetUsers
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.id_Usuario,
        t.Nombres,
        t.Apellidos,
        u.Email,
        r.Rol AS Rol,
        e.Estado AS Estado
    FROM
        Usuario u
    INNER JOIN
        Rol r ON u.id_Rol = r.id_Rol
    INNER JOIN
        EstadoUsuario e ON u.id_Estado = e.id_Estado
    LEFT JOIN
        Tutor t ON u.id_Usuario = t.id_Usuario;
END
GO
