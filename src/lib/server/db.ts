import { PrismaClient } from '@prisma/client'
import { AddChannel, RemoveChannel, GetChannels } from './db/channels'
import { saveToken, loadToken } from './db/tokens';
import type { AccessToken } from '@twurple/auth';
import type { HelixUser } from '@twurple/api';
import { updateUser, updateUserAuthorization, getAuthorizedUsers, getAdminUsers, updateUserSetupCompleteStatus, updateUserPreferences, updateUserCollection, getUserPreferences, resetUserCollection } from './db/users';

const prisma = new PrismaClient()

export const DbAddChannel = (userId: string) => AddChannel(prisma, userId);
export const DbRemoveChannel = (userId: string) => RemoveChannel(prisma, userId);
export const DbGetChannels = () => GetChannels(prisma);

export const DbSaveToken = (user_id: string, token_data: AccessToken) => saveToken(prisma, user_id, token_data);
export const DbLoadToken = (user_id: string) => loadToken(prisma, user_id);

export const DbUpdateUser = (twitch_user: HelixUser) => updateUser(prisma, twitch_user);
export const DbUpdateUserAuthorization = (username: string, isAuthorized: boolean) => updateUserAuthorization(prisma, username, isAuthorized);
export const DbGetAuthorizedUsers = () => getAuthorizedUsers(prisma)
export const DbGetAdminUsers = () => getAdminUsers(prisma)
export const DbUpdateUserSetupCompleteStatus = (username: string, isComplete: boolean) => updateUserSetupCompleteStatus(prisma, username, isComplete)
export const DbUpdateUserPreferences = (twitchId: string, duration: number, selectionCount: number, subsExtraVote: boolean) => updateUserPreferences(prisma, twitchId, duration, selectionCount, subsExtraVote)
export const DbUpdateUserCollection = (twitchId: string, cards: string[]) => updateUserCollection(prisma, twitchId, cards)
export const DbResetUserCollection = (twitchId: string) => resetUserCollection(prisma, twitchId)
export const DbGetUserPreferences = (twitchName: string) => getUserPreferences(prisma, twitchName);