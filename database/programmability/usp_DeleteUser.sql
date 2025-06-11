CREATE OR ALTER PROCEDURE usp_DeleteUser
    @id_Usuario INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @InactivoEstadoId INT;
    SELECT @InactivoEstadoId = id_Estado FROM EstadoUsuario WHERE Estado = 'Inactivo';

    IF @InactivoEstadoId IS NULL
    BEGIN
        RAISERROR('The ''Inactivo'' user state does not exist.', 16, 1);
        RETURN;
    END

    UPDATE Usuario
    SET id_Estado = @InactivoEstadoId
    WHERE id_Usuario = @id_Usuario;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('User not found.', 16, 1);
        RETURN;
    END
END
GO
