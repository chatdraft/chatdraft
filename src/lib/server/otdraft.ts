import { minutes_to_ms } from '$lib/constants';
import { OtdStatus } from '$lib/snap/draft';
import { GetOneTimeDraft } from './draftHandler';

export const GetOtdStatus = (draft: {
	finishedAt: Date | null;
	startedAt: Date | null;
	cards: string | null;
	id: string;
	batchId: string;
	batch: {
		expiration: Date;
		draftExpiration: number;
	};
}) => {
	if (!draft.finishedAt && Date.now() > draft.batch.expiration.getTime()) {
		return OtdStatus.LinkExpired;
	}
	if (
		draft.startedAt &&
		!draft.cards &&
		Date.now() - draft.startedAt.getTime() > draft.batch.draftExpiration * minutes_to_ms
	) {
		return OtdStatus.DraftExpired;
	}
	if (draft.startedAt && !draft.cards) {
		return OtdStatus.Started;
	}
	if (draft.cards) {
		return OtdStatus.Finished;
	}

	const liveDraft = GetOneTimeDraft(draft.id);
	if (liveDraft) {
		if (liveDraft.startTime) {
			return OtdStatus.Started;
		}
	}

	return OtdStatus.Unused;
};
