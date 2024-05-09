BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[User] ADD [isOrganizer] BIT NOT NULL CONSTRAINT [User_isOrganizer_df] DEFAULT 0;

-- CreateTable
CREATE TABLE [dbo].[_OneTimeDraftBatchToUser] (
    [A] NVARCHAR(1000) NOT NULL,
    [B] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [_OneTimeDraftBatchToUser_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_OneTimeDraftBatchToUser_B_index] ON [dbo].[_OneTimeDraftBatchToUser]([B]);

-- AddForeignKey
ALTER TABLE [dbo].[_OneTimeDraftBatchToUser] ADD CONSTRAINT [_OneTimeDraftBatchToUser_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[OneTimeDraftBatch]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_OneTimeDraftBatchToUser] ADD CONSTRAINT [_OneTimeDraftBatchToUser_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
