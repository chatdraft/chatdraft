/*
  Warnings:

  - You are about to drop the column `expiration` on the `OneTimeDraft` table. All the data in the column will be lost.
  - Added the required column `batchTag` to the `OneTimeDraft` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[OneTimeDraft] DROP COLUMN [expiration];
ALTER TABLE [dbo].[OneTimeDraft] ADD [batchTag] NVARCHAR(1000) NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[OneTimeDraftBatch] (
    [tag] NVARCHAR(1000) NOT NULL,
    [expiration] DATETIME2 NOT NULL,
    CONSTRAINT [OneTimeDraftBatch_pkey] PRIMARY KEY CLUSTERED ([tag])
);

-- AddForeignKey
ALTER TABLE [dbo].[OneTimeDraft] ADD CONSTRAINT [OneTimeDraft_batchTag_fkey] FOREIGN KEY ([batchTag]) REFERENCES [dbo].[OneTimeDraftBatch]([tag]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
