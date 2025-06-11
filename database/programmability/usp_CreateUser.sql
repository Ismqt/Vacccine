CREATE OR ALTER PROCEDURE usp_CreateUser
    @id_Rol INT,
    @Cedula_Usuario NVARCHAR(15),
    @Email NVARCHAR(100),
    @Clave NVARCHAR(255) -- This should be the pre-hashed password from the app
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Usuario WHERE Email = @Email OR Cedula_Usuario = @Cedula_Usuario)
    BEGIN
        RAISERROR('User with the provided Email or Cedula already exists.', 16, 1);
        RETURN;
    END

    INSERT INTO Usuario (id_Rol, id_Estado, Cedula_Usuario, Email, Clave)
    VALUES (@id_Rol, 1, @Cedula_Usuario, @Email, @Clave); -- Default state 1 = 'Activo'

    SELECT SCOPE_IDENTITY() AS id_Usuario;
END
GO
