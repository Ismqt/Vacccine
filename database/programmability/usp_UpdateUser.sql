CREATE OR ALTER PROCEDURE usp_UpdateUser
    @id_Usuario INT,
    @id_Rol INT,
    @id_Estado INT,
    @Cedula_Usuario NVARCHAR(15),
    @Email NVARCHAR(100),
    @id_CentroVacunacion INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Usuario WHERE (Email = @Email OR Cedula_Usuario = @Cedula_Usuario) AND id_Usuario <> @id_Usuario)
    BEGIN
        RAISERROR('Another user with the provided Email or Cedula already exists.', 16, 1);
        RETURN;
    END

    UPDATE Usuario
    SET
        id_Rol = @id_Rol,
        id_Estado = @id_Estado,
        Cedula_Usuario = @Cedula_Usuario,
        Email = @Email,
        id_CentroVacunacion = @id_CentroVacunacion
    WHERE
        id_Usuario = @id_Usuario;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('User not found or no data changed.', 16, 1);
        RETURN;
    END
END
GO
