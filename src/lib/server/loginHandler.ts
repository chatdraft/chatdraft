import { DatetimeNowUtc } from '$lib/datetime';

type TStateToken = string;
type TLoginRequest = {
	redirectUri: string;
	expiresOn: Date;
};

const loginRequests: Map<TStateToken, { redirectUri: string; expiresOn: Date }> = new Map();

export function PushLoginRequest(stateToken: TStateToken, details: TLoginRequest) {
	loginRequests.set(stateToken, details);
}

export function PopLoginRequest(stateToken: TStateToken) {
	const request = loginRequests.get(stateToken);
	if (request) {
		loginRequests.delete(stateToken);
	}
	return request;
}

export function IsLoginRequestExpired(loginRequest: TLoginRequest) {
	return DatetimeNowUtc() > loginRequest.expiresOn.getTime();
}

export function ClearExpiredLoginRequests() {
	loginRequests.forEach((loginRequest, state) => {
		if (IsLoginRequestExpired(loginRequest)) {
			loginRequests.delete(state);
		}
	});
}
