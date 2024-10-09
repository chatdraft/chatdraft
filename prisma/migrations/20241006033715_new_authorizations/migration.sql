BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[UserAuthorization] (
    [userId] NVARCHAR(1000) NOT NULL,
    [chatDraft] BIT NOT NULL CONSTRAINT [UserAuthorization_chatDraft_df] DEFAULT 0,
    [soloDraft] BIT NOT NULL CONSTRAINT [UserAuthorization_soloDraft_df] DEFAULT 0,
    [cubeDraft] BIT NOT NULL CONSTRAINT [UserAuthorization_cubeDraft_df] DEFAULT 0,
    CONSTRAINT [UserAuthorization_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- AddForeignKey
ALTER TABLE [dbo].[UserAuthorization] ADD CONSTRAINT [UserAuthorization_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

INSERT INTO [dbo].[UserAuthorization] ([userId], [chatDraft]) SELECT u.[id], u.[isAuthorized] FROM [dbo].[User] as u

-- AlterTable
ALTER TABLE [dbo].[User] DROP CONSTRAINT [User_isAuthorized_df]
ALTER TABLE [dbo].[User] DROP COLUMN [isAuthorized];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
