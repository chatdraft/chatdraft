BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[UserPreference] ALTER COLUMN [collection] NVARCHAR(max) NULL;

-- CreateTable
CREATE TABLE [dbo].[OneTimeDraftBatch] (
    [id] NVARCHAR(1000) NOT NULL,
    [tag] NVARCHAR(1000) NOT NULL,
    [expiration] DATETIME2 NOT NULL,
    [cardPool] NVARCHAR(max) NOT NULL,
    CONSTRAINT [OneTimeDraftBatch_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [OneTimeDraftBatch_tag_key] UNIQUE NONCLUSTERED ([tag])
);

-- CreateTable
CREATE TABLE [dbo].[OneTimeDraft] (
    [id] NVARCHAR(1000) NOT NULL,
    [batchId] NVARCHAR(1000) NOT NULL,
    [startedAt] DATETIME2,
    [finishedAt] DATETIME2,
    [cards] NVARCHAR(1000),
    CONSTRAINT [OneTimeDraft_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[OneTimeDraft] ADD CONSTRAINT [OneTimeDraft_batchId_fkey] FOREIGN KEY ([batchId]) REFERENCES [dbo].[OneTimeDraftBatch]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
