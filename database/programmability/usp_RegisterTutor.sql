PRINT 'Creating Stored Procedure usp_RegisterTutor...';
GO

IF OBJECT_ID('dbo.usp_RegisterTutor', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.usp_RegisterTutor;
END
GO

CREATE PROCEDURE dbo.usp_RegisterTutor
    @Cedula_Tutor NVARCHAR(15),
    @Nombres_Tutor NVARCHAR(100),
    @Apellidos_Tutor NVARCHAR(100),
    @Telefono_Tutor NVARCHAR(20) = NULL,
    @Email_Tutor NVARCHAR(100) = NULL, -- Email for Tutor record, can be different from Usuario email
    @Direccion_Tutor NVARCHAR(200) = NULL,
    @Email_Usuario NVARCHAR(100),       -- Email for Usuario record (login)
    @Clave_Usuario NVARCHAR(255),        -- Hashed password
    @OutputMessage NVARCHAR(255) OUTPUT,
    @New_id_Usuario INT OUTPUT,
    @New_id_Tutor INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_Rol_Tutor INT;
    DECLARE @id_Estado_Activo INT;

    -- Get ID for 'Tutor' role (assuming it's 5 from initial data in schema.sql)
    SELECT @id_Rol_Tutor = id_Rol FROM dbo.Rol WHERE Rol = 'Tutor';
    IF @id_Rol_Tutor IS NULL
    BEGIN
        SET @OutputMessage = 'Error: Role ''Tutor'' not found. Please ensure initial data is populated.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    -- Get ID for 'Activo' state (assuming it's 1 from initial data in schema.sql)
    SELECT @id_Estado_Activo = id_Estado FROM dbo.EstadoUsuario WHERE Estado = 'Activo';
    IF @id_Estado_Activo IS NULL
    BEGIN
        SET @OutputMessage = 'Error: User state ''Activo'' not found. Please ensure initial data is populated.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    -- Check if Cedula_Tutor already exists in Tutor table
    IF EXISTS (SELECT 1 FROM dbo.Tutor WHERE Cedula_Tutor = @Cedula_Tutor)
    BEGIN
        SET @OutputMessage = 'Error: Tutor with this Cedula (ID document) already exists.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    -- Check if Email_Usuario (for login) already exists in Usuario table
    IF EXISTS (SELECT 1 FROM dbo.Usuario WHERE Email = @Email_Usuario)
    BEGIN
        SET @OutputMessage = 'Error: A user account with this login Email already exists.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    -- Check if Email_Tutor (contact email for tutor, if provided and different from login email) already exists in Tutor table
    IF @Email_Tutor IS NOT NULL AND @Email_Tutor <> @Email_Usuario AND EXISTS (SELECT 1 FROM dbo.Tutor WHERE Email = @Email_Tutor)
    BEGIN
        SET @OutputMessage = 'Error: A tutor record with this contact Email already exists.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    BEGIN TRY
        -- Insert into Usuario table
        -- The Cedula_Usuario in Usuario table can store the Tutor's Cedula for reference or if the user is directly the tutor.
        INSERT INTO dbo.Usuario (id_Rol, id_Estado, Email, Clave, Cedula_Usuario)
        VALUES (@id_Rol_Tutor, @id_Estado_Activo, @Email_Usuario, @Clave_Usuario, @Cedula_Tutor);

        SET @New_id_Usuario = SCOPE_IDENTITY();

        -- Insert into Tutor table
        INSERT INTO dbo.Tutor (id_Usuario, Cedula_Tutor, Nombres, Apellidos, Telefono, Email, Direccion)
        VALUES (@New_id_Usuario, @Cedula_Tutor, @Nombres_Tutor, @Apellidos_Tutor, @Telefono_Tutor, @Email_Tutor, @Direccion_Tutor);

        SET @New_id_Tutor = SCOPE_IDENTITY();

        COMMIT TRANSACTION;
        SET @OutputMessage = 'Tutor registered successfully. User Account ID: ' + CAST(@New_id_Usuario AS NVARCHAR(10)) + ', Tutor Record ID: ' + CAST(@New_id_Tutor AS NVARCHAR(10)) + '.';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        -- Construct a more detailed error message if possible
        SET @OutputMessage = 'Error registering Tutor: ' + ERROR_MESSAGE() + ' (Procedure: ' + ERROR_PROCEDURE() + ', Line: ' + CAST(ERROR_LINE() AS NVARCHAR(10)) + ')';
        
        -- Re-throw the error to ensure the client application is aware of the failure
        THROW;
        RETURN;
    END CATCH
END;
GO

PRINT 'Stored Procedure usp_RegisterTutor created/updated successfully.';
GO
