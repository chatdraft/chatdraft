BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[OneTimeDraft] (
    [id] NVARCHAR(1000) NOT NULL,
    [startedAt] DATETIME2,
    [finishedAt] DATETIME2,
    [cards] NVARCHAR(1000),
    CONSTRAINT [OneTimeDraft_pkey] PRIMARY KEY CLUSTERED ([id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
