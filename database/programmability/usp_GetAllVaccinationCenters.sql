/****** Object:  StoredProcedure [dbo].[usp_GetAllVaccinationCenters]    Script Date: 14/6/2025 7:33:54 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[usp_GetAllVaccinationCenters]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        cv.id_CentroVacunacion,
        cv.NombreCentro,
        cv.NombreCorto,
        cv.Direccion,
        p.Nombre AS Provincia,
        m.Nombre AS Municipio,
        cv.Telefono,
        cv.Director,
        cv.Web,
        cv.Capacidad,
        e.NombreEstado
    FROM 
        dbo.CentroVacunacion cv
    LEFT JOIN 
        dbo.Provincia p ON cv.id_Provincia = p.id_Provincia
    LEFT JOIN 
        dbo.Municipio m ON cv.id_Municipio = m.id_Municipio
    LEFT JOIN 
        dbo.EstadosCentro e ON cv.id_Estado = e.id_Estado;

END;
GO
