-- Add the id_CentroVacunacion column to the Usuario table
ALTER TABLE dbo.Usuario
ADD id_CentroVacunacion INT NULL;
GO

-- Add a foreign key constraint to ensure data integrity
ALTER TABLE dbo.Usuario
ADD CONSTRAINT FK_Usuario_CentroVacunacion FOREIGN KEY (id_CentroVacunacion)
REFERENCES dbo.CentroVacunacion(id_CentroVacunacion);
GO
