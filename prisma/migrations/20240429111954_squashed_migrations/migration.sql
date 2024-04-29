BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [channelName] NVARCHAR(1000) NOT NULL,
    [displayName] NVARCHAR(1000),
    [isAdmin] BIT NOT NULL CONSTRAINT [User_isAdmin_df] DEFAULT 0,
    [isAuthorized] BIT NOT NULL CONSTRAINT [User_isAuthorized_df] DEFAULT 0,
    [twitchID] NVARCHAR(1000),
    [twitchProfilePictureURL] NVARCHAR(1000),
    [initialSetupDone] BIT NOT NULL CONSTRAINT [User_initialSetupDone_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_channelName_key] UNIQUE NONCLUSTERED ([channelName]),
    CONSTRAINT [User_twitchID_key] UNIQUE NONCLUSTERED ([twitchID])
);

-- CreateTable
CREATE TABLE [dbo].[Token] (
    [id] NVARCHAR(1000) NOT NULL,
    [twitchID] NVARCHAR(1000) NOT NULL,
    [twitchChannelName] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000),
    CONSTRAINT [Token_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Token_twitchID_key] UNIQUE NONCLUSTERED ([twitchID])
);

-- CreateTable
CREATE TABLE [dbo].[UserPreference] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [draftRoundDuration] INT NOT NULL CONSTRAINT [UserPreference_draftRoundDuration_df] DEFAULT 90,
    [cardsPerRound] INT NOT NULL CONSTRAINT [UserPreference_cardsPerRound_df] DEFAULT 6,
    [subsExtraVote] BIT NOT NULL CONSTRAINT [UserPreference_subsExtraVote_df] DEFAULT 0,
    [botJoinsChannel] BIT NOT NULL CONSTRAINT [UserPreference_botJoinsChannel_df] DEFAULT 0,
    [snapFanApiKey] NVARCHAR(1000),
    [collection] NVARCHAR(max),
    [bgOpacity] INT NOT NULL CONSTRAINT [UserPreference_bgOpacity_df] DEFAULT 70,
    CONSTRAINT [UserPreference_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserPreference_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[Draft] (
    [id] NVARCHAR(1000) NOT NULL,
    [playerId] NVARCHAR(1000) NOT NULL,
    [cards] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Draft_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [finishedAt] DATETIME2,
    CONSTRAINT [Draft_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Round] (
    [id] NVARCHAR(1000) NOT NULL,
    [draftId] NVARCHAR(1000) NOT NULL,
    [winner] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Round_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[VoteResult] (
    [id] NVARCHAR(1000) NOT NULL,
    [roundId] NVARCHAR(1000) NOT NULL,
    [cardDefKey] NVARCHAR(1000) NOT NULL,
    [votes] INT NOT NULL,
    CONSTRAINT [VoteResult_pkey] PRIMARY KEY CLUSTERED ([id])
);

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
ALTER TABLE [dbo].[Token] ADD CONSTRAINT [Token_twitchID_fkey] FOREIGN KEY ([twitchID]) REFERENCES [dbo].[User]([twitchID]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserPreference] ADD CONSTRAINT [UserPreference_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([twitchID]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Draft] ADD CONSTRAINT [Draft_playerId_fkey] FOREIGN KEY ([playerId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Round] ADD CONSTRAINT [Round_draftId_fkey] FOREIGN KEY ([draftId]) REFERENCES [dbo].[Draft]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[VoteResult] ADD CONSTRAINT [VoteResult_roundId_fkey] FOREIGN KEY ([roundId]) REFERENCES [dbo].[Round]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

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
