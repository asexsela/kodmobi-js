/* tslint:disable */

export interface IKodmobiSettings {
	readonly language: string;
	readonly project: IKodmobiSettingsProject;
	readonly code: IKodmobiSettingsCode;
	readonly challenge: IKodmobiSettingsChallenge;
}

export interface IKodmobiSettingsProject {
	readonly name: string;
}

export interface IKodmobiSettingsCode {
	readonly length: number;
	readonly hasDigits: boolean;
	readonly hasLetters: boolean;
}

export interface IKodmobiSettingsChallenge {
	readonly enabled: boolean;
	readonly apiKey: string | undefined;
}

export interface IKodmobiChannel {
	readonly name: string;
	readonly type: string;
	readonly isActive: boolean;
	readonly timeout: number;
	readonly desc: string | undefined;
	readonly iconUrl: string | undefined;
	readonly link: string | undefined;
}

export interface IKodmobiSession {
	readonly sessionId: string;
	readonly sessionExpires: Date;
}

export interface IKodmobiSessionChannel {
	readonly prefered: IKodmobiChannel | undefined;
	readonly list: IKodmobiChannel[];
}

export interface IKodmobiSessionCheck {
	readonly success: boolean;
	readonly isVerified: boolean;
	readonly data: any;
}

export class Kodmobi {
	constructor(apiKey: string, baseUrl?: string | null);

	readonly settings: IKodmobiSettings | null;
	readonly preferedChannel: IKodmobiChannel | null;
	readonly sessionChannels: IKodmobiChannel[];
	readonly destination: string | null;
	readonly session: IKodmobiSession | null;

	setVerifyCallback(cb: Function): void;

	getChannels(): Promise<IKodmobiChannel[]>;
	create(to: string, send?: boolean): Promise<IKodmobiSessionChannel>;
	send(channel: string): Promise<boolean>;
	check(code: string): Promise<IKodmobiSessionCheck>;

	on(event: string, listener: Function): self;
	once(event: string, listener: Function): self;
	off(event: string, listener: Function): self;
	emit(event: string, ...args: any): void;
}

export interface Constants {
	URL: {
		V2: string;
		V2_1: string;
	};
	EVENT: {
		SESSION_CREATED: string;
		SESSION_LOADED: string;
		SESSION_EXPIRED: string;
		SESSION_SUCCESS: string;
		SESSION_TIMER: string;
		CHANNEL_TIMER: string;
		ERROR: string;
	};
	ERROR: {
		PROJECT_HAS_NO_CHANNELS: string;
		PROJECT_HAS_NO_CHANNEL: string;
		USER_NOT_AUTHORIZE_ON_CHANNEL: string;
		SESSION_EXPIRED: string;
		MESSAGE_WRONG_CODE: string;
		CHANNEL_NOT_ALLOWED_COUNTRY: string;
		MESSAGE_ATTEMPT: string;
		PHONE_BLOCKED: string;
		USER_BLOCKED: string;
		CHALLENGE_FAILED: string;
		BAD_REQUEST: string;
		WRONG_BALANCE: string;
		ACCESS_DENIED: string;
	};
}

export declare const CONSTANTS: Constants;
