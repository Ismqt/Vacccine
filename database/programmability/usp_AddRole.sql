-- =============================================
-- Author:      Cascade
-- Create date: 2024-06-14
-- Description: Adds a new role to the system.
-- =============================================
CREATE PROCEDURE usp_AddRole
    @RolName NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.Rol WHERE Rol = @RolName)
    BEGIN
        INSERT INTO dbo.Rol (Rol)
        VALUES (@RolName);
    END
END
GO
