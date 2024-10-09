BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[UserAuthorization] ADD [cubeDraftCreateLobby] BIT NOT NULL CONSTRAINT [UserAuthorization_cubeDraftCreateLobby_df] DEFAULT 0;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
