PRINT 'Creating Scalar Function fn_CalculateAge...';
GO

IF OBJECT_ID('dbo.fn_CalculateAge', 'FN') IS NOT NULL
BEGIN
    DROP FUNCTION dbo.fn_CalculateAge;
END
GO

CREATE FUNCTION dbo.fn_CalculateAge
(
    @FechaNacimiento DATE,
    @FechaReferencia DATE = NULL -- Defaults to current date if not provided
)
RETURNS INT
AS
BEGIN
    DECLARE @Age INT;
    DECLARE @RefDate DATE;

    SET @RefDate = ISNULL(@FechaReferencia, GETDATE());

    -- Basic age calculation
    SET @Age = DATEDIFF(YEAR, @FechaNacimiento, @RefDate);

    -- Adjust if the birthday for the current year hasn't occurred yet
    -- This check ensures that if someone's birthday is later in the year than the reference date's month/day,
    -- their age is decremented by 1 from the simple DATEDIFF(YEAR) result.
    IF (MONTH(@FechaNacimiento) > MONTH(@RefDate)) OR 
       (MONTH(@FechaNacimiento) = MONTH(@RefDate) AND DAY(@FechaNacimiento) > DAY(@RefDate))
    BEGIN
        SET @Age = @Age - 1;
    END

    -- Handle cases where birth date might be in the future relative to reference date (age would be negative)
    -- Or if birth date is invalid (e.g., after reference date resulting in negative age from DATEDIFF)
    -- For simplicity, return 0 if calculated age is negative, or handle as an error if preferred.
    IF @Age < 0
    BEGIN
        SET @Age = 0; -- Or perhaps NULL, or raise an error depending on desired behavior for invalid inputs.
    END

    RETURN @Age;
END;
GO

PRINT 'Function fn_CalculateAge created successfully.';
GO

-- Example Usage (can be commented out or removed from the script executed by sqlcmd):
/*
PRINT 'Testing fn_CalculateAge:';
PRINT 'Born 2000-01-01, Ref 2023-06-15: ' + CAST(dbo.fn_CalculateAge('2000-01-01', '2023-06-15') AS VARCHAR(10)); -- Expected: 23
PRINT 'Born 2000-12-31, Ref 2023-06-15: ' + CAST(dbo.fn_CalculateAge('2000-12-31', '2023-06-15') AS VARCHAR(10)); -- Expected: 22
PRINT 'Born 2022-06-15, Ref 2023-06-14: ' + CAST(dbo.fn_CalculateAge('2022-06-15', '2023-06-14') AS VARCHAR(10)); -- Expected: 0
PRINT 'Born 2022-06-15, Ref 2023-06-15: ' + CAST(dbo.fn_CalculateAge('2022-06-15', '2023-06-15') AS VARCHAR(10)); -- Expected: 1
PRINT 'Born 2022-06-15, Ref 2023-06-16: ' + CAST(dbo.fn_CalculateAge('2022-06-15', '2023-06-16') AS VARCHAR(10)); -- Expected: 1
PRINT 'Born today, Ref today: ' + CAST(dbo.fn_CalculateAge(GETDATE(), GETDATE()) AS VARCHAR(10)); -- Expected: 0
PRINT 'Born tomorrow, Ref today: ' + CAST(dbo.fn_CalculateAge(DATEADD(day, 1, GETDATE()), GETDATE()) AS VARCHAR(10)); -- Expected: 0 (due to @Age < 0 check)
*/
GO
