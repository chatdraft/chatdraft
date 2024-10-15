<script lang="ts">
	import { User, UserAuthorization, UserPreference } from '@prisma/client';
	import ChatDraftSlideToggle from './ChatDraftSlideToggle.svelte';
	import { enhance } from '$app/forms';

	export let users:
		| (User & { authorization: UserAuthorization | null; userPreferences: UserPreference | null })[]
		| undefined;

	let editingUser: User | undefined = undefined;
</script>

<div class="table-container m-4 overflow-x-visible">
	<form
		method="post"
		action="?/updateUser"
		use:enhance={() => {
			return async ({ result, update }) => {
				editingUser = undefined;
				update();
			};
		}}
	>
		<table
			class="table table-hover table-compact text-center border-collapse w-min overflow-scroll"
		>
			<thead class="sticky top-0">
				<tr>
					<th class="table-cell-fit">Name</th>
					<th class="table-cell-fit">Is Admin</th>
					<th class="table-cell-fit">Is Organizer</th>
					<th class="table-cell-fit">Setup Done</th>
					<th class="table-cell-fit">Chat Draft</th>
					<th class="table-cell-fit">Cube Draft</th>
					<th class="table-cell-fit">Create Lobbies</th>
					<th class="table-cell-fit">Solo Draft</th>
					<th class="table-cell-fit">Collection Updated</th>
					<th class="table-cell-fit">Edit</th>
				</tr>
			</thead>
			<tbody>
				{#if users}
					{#each users as user}
						{#if editingUser && editingUser.id == user.id}
							<input type="hidden" name="id" value={user.id} />
						{/if}
						<tr class="align-middle">
							<td class="table-cell-fit !align-middle">
								{user.displayName}
							</td>
							<td class="table-cell-fit !align-middle">
								{user.isAdmin ? '✅' : '❌'}
							</td>
							<td class="table-cell-fit !align-middle">
								{#if editingUser && editingUser.id == user.id}
									<ChatDraftSlideToggle
										label=""
										checked={user.isOrganizer}
										name="isOrganizer"
										active="bg-secondary-500"
										size="sm"
									/>
								{:else}
									{user.isOrganizer ? '✅' : '❌'}
								{/if}
							</td>
							<td class="table-cell-fit !align-middle">
								{#if editingUser && editingUser.id == user.id}
									<ChatDraftSlideToggle
										label=""
										checked={user.initialSetupDone}
										name="initialSetupDone"
										active="bg-secondary-500"
										size="sm"
									/>
								{:else}
									{user.initialSetupDone ? '✅' : '❌'}
								{/if}
							</td>
							<td class="table-cell-fit">
								{#if editingUser && editingUser.id == user.id}
									<ChatDraftSlideToggle
										label=""
										checked={user.authorization?.chatDraft || false}
										name="canChatDraft"
										active="bg-secondary-500"
										size="sm"
									/>
								{:else}
									{user.authorization?.chatDraft ? '✅' : '❌'}
								{/if}
							</td>
							<td class="table-cell-fit !align-middle">
								{#if editingUser && editingUser.id == user.id}
									<ChatDraftSlideToggle
										label=""
										checked={user.authorization?.cubeDraft || false}
										name="canCubeDraft"
										active="bg-secondary-500"
										size="sm"
									/>
								{:else}
									{user.authorization?.cubeDraft ? '✅' : '❌'}
								{/if}
							</td>
							<td class="table-cell-fit !align-middle">
								{#if editingUser && editingUser.id == user.id}
									<ChatDraftSlideToggle
										label=""
										checked={user.authorization?.cubeDraftCreateLobby || false}
										name="canCreateCubeDraftLobby"
										active="bg-secondary-500"
										size="sm"
									/>
								{:else}
									{user.authorization?.cubeDraftCreateLobby ? '✅' : '❌'}
								{/if}
							</td>
							<td class="table-cell-fit !align-middle">
								{#if editingUser && editingUser.id == user.id}
									<ChatDraftSlideToggle
										label=""
										checked={user.authorization?.soloDraft || false}
										name="canSoloDraft"
										active="bg-secondary-500"
										size="sm"
									/>
								{:else}
									{user.authorization?.soloDraft ? '✅' : '❌'}
								{/if}
							</td>
							<td class="table-cell-fit !align-middle">
								{user.userPreferences?.collectionLastUpdated
									? user.userPreferences?.collectionLastUpdated.toLocaleDateString()
									: 'Never'}
							</td>
							<td class="table-cell-fit !align-middle">
								{#if !editingUser}
									<button
										class="btn variant-filled-secondary btn-sm"
										on:click={() => (editingUser = user)}
									>
										Edit
									</button>
								{:else if editingUser.id == user.id}
									<div class="flex flex-row">
										<button class="btn variant-filled-primary btn-sm" type="submit"> Save </button>
										<button
											class="btn variant-filled-warning btn-sm"
											on:click={() => (editingUser = undefined)}
											type="button"
										>
											Cancel
										</button>
									</div>
								{/if}
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</form>
</div>
