"use strict";

import Api from "./api.js";
import Storage from "./storage.js";
import Event from "./event.js";
import Logger from "./log.js";

import {
	COOKIE_DESTINATION,
	COOKIE_SESSION_ID,
	EVENT_ERROR,
	EVENT_READY,
	EVENT_SESSION_CREATED,
	EVENT_SESSION_EXPIRED,
	EVENT_SESSION_LOADED,
	EVENT_SESSION_SUCCESS,
	PROJECT_HAS_NO_CHANNEL,
	SESSION_EXPIRED,
	USER_NOT_AUTHORIZE_ON_CHANNEL,
} from "./constants.js";
import Timer from "./timer.js";
import { parseHintByErr } from "./utils.js";

export default class Kodmobi extends Event {
	#storage;
	#api;
	#timer;

	#verifyCallback;

	constructor(apiKey, baseUrl) {
		super();

		this.#api = new Api(apiKey, baseUrl, this.emit.bind(this));
		this.#storage = new Storage();
		this.#timer = new Timer(this.emit.bind(this));

		this.#init();
	}

	get settings() {
		return this.#storage.settings;
	}

	get prefered() {
		return this.#storage?.channel?.prefered || null;
	}

	get destination() {
		return this.#storage?.session?.destination || null;
	}

	get session() {
		const session = this.#storage?.session;
		return session
			? {
					sessionId: session?.sessionId,
					sessionExpired: session?.sessionExpired,
				}
			: null;
	}

	setVerifyCallback(cb) {
		this.#verifyCallback = cb.bind(undefined);
	}

	async channels() {
		const sessionChannels = this.#storage?.channel?.list;

		if (sessionChannels) {
			return sessionChannels;
		}

		const sessionId = Storage.getCookie(COOKIE_SESSION_ID);
		const { ok, data: channels } = await this.#api.getChannels(
			sessionId || "",
		);

		return ok ? channels : [];
	}

	async create(to, send) {
		try {
			const { ok, data } = await this.#api.createSession(to, send);

			if (!ok) {
				return null;
			}

			const session = {
				destination: to,
				sessionId: data.session_id,
				sessionExpired: data.session_expired_at,
			};

			if (this.#storage.isNewSession(session.sessionId)) {
				this.#timer.clear();
			} else {
				Logger.warn("Session already exists, skipping...");
				return;
			}

			const isNew = !this.#storage.hasSession();

			this.#storage.session = session;

			const expiresIso = new Date(session.sessionExpired).toUTCString();
			Storage.setCookie(COOKIE_DESTINATION, to, expiresIso);

			const channels = data.channels.map((ch) => {
				return {
					name: ch.name,
					type: ch.type,
					isActive: ch.is_active,
					timeout: ch.timeout,
					desc: ch.description,
					iconUrl: ch.image_url,
					link: ch.link,
				};
			});

			this.#storage.channel = {
				prefered: channels.find((ch) => ch.type === data.sent_to),
				list: channels,
			};

			// load cookies
			this.#loadCookies();
			// load timers
			this.#loadTimers();

			if (isNew) {
				this.emit(EVENT_SESSION_CREATED, {
					...this.#storage.channel,
				});
			}

			return this.#storage.channel;
		} catch (err) {
			Logger.error(err.toString());
			return null;
		}
	}

	async send(channel) {
		const session = this.#storage.session;

		if (!session) {
			const sysMessage = SESSION_EXPIRED;
			const hint = parseHintByErr(sysMessage);
			const text =
				"You are thinking too long, try again with new session";
			this.emit(EVENT_ERROR, {
				message: text,
				hint,
				sysMessage,
			});
			Logger.error(text, hint);
			return false;
		}

		const channels = this.#storage?.channel?.list || [];
		const ch = channels.find((ch) => ch.type === channel);

		if (!ch) {
			const sysMessage = PROJECT_HAS_NO_CHANNEL;
			const hint = parseHintByErr(sysMessage);
			const text = `The project does not have a [${channel}] channel`;
			this.emit(EVENT_ERROR, {
				message: text,
				hint,
				sysMessage,
			});
			Logger.error(text, hint);
			return false;
		}

		if (!ch.isActive) {
			const sysMessage = USER_NOT_AUTHORIZE_ON_CHANNEL;
			const hint = parseHintByErr(sysMessage);
			const text = `Channel is not active for this user!`;
			this.emit(EVENT_ERROR, {
				message: text,
				hint,
				sysMessage,
			});
			Logger.error(text, hint);
			return false;
		}

		const { ok, data } = await this.#api.sendCode(
			session.sessionId,
			channel,
		);

		if (!ok) {
			return false;
		}

		if (data.channel.timeout > 0) {
			this.#timer.startChannelTimer(
				data.channel.type,
				data.channel.timeout,
			);

			ch.timeout = data.channel.timeout;
			this.#storage?.setPrefered(ch);
		}

		return true;
	}

	async check(code) {
		const session = this.#storage.session;

		const result = {
			success: false,
			isVerified: false,
			destination: this.destination,
			data: null,
		};

		if (!session) {
			const sysMessage = SESSION_EXPIRED;
			const hint = parseHintByErr(sysMessage);
			const text =
				"You are thinking too long, try again with new session";

			this.emit(EVENT_ERROR, {
				message: text,
				hint,
				sysMessage,
			});
			return result;
		}

		const { ok, data } = await this.#api.checkCode(session.sessionId, code);
		result.success = ok;

		if (!ok) {
			return result;
		}

		this.#clear();

		if (typeof this.#verifyCallback == "function") {
			const res = await this.#verifyCallback({
				verifyToken: data.verify_token,
			});

			if (res?.ok !== undefined) {
				result.isVerified = res.ok;
			}

			if (res?.data !== undefined) {
				result.data = res.data;
			}
		}

		this.emit(EVENT_SESSION_SUCCESS, { ...result });

		return result;
	}

	async #init() {
		Logger.welcome();

		await this.#loadSettings();
		const isSessionLoaded = await this.#loadSession();

		this.once(EVENT_SESSION_EXPIRED, this.#expiredListener.bind(this));

		this.emit(EVENT_READY, {
			isNewSession: !isSessionLoaded,
			settings: this.settings,
			prefered: this.prefered,
			destination: this.destination,
			session: this.session,
			setVerifyCallback: this.setVerifyCallback.bind(this),
			channels: this.channels.bind(this),
			create: this.create.bind(this),
			send: this.send.bind(this),
			check: this.check.bind(this),
		});

		if (isSessionLoaded) {
			this.emit(EVENT_SESSION_LOADED, { ...this.#storage.channel });
		}
	}

	async #loadSettings() {
		const sessionId = Storage.getCookie(COOKIE_SESSION_ID);
		const { ok, data, reason } = await this.#api.getSettings(
			sessionId || "",
		);

		if (!ok) {
			Logger.error(reason);
			return;
		}

		this.#storage.settings = {
			language: data.language,
			project: data.project,
			code: {
				length: data.code.length,
				hasDigits: data.code.digits,
				hasLetters: data.code.letters,
			},
			challenge: {
				enabled: data.challenge.enabled,
				apiKey: data.challenge.api_key,
			},
		};
	}

	async #loadSession() {
		const to = Storage.getCookie(COOKIE_DESTINATION);

		if (to) {
			const { ok, data } = await this.#api.createSession(to, false);

			if (!ok) {
				return;
			}

			this.#storage.session = {
				destination: to,
				sessionId: data.session_id,
				sessionExpired: data.session_expired_at,
			};

			const channels = data.channels.map((ch) => {
				return {
					name: ch.name,
					type: ch.type,
					isActive: ch.is_active,
					timeout: ch.timeout,
					desc: ch.description,
					iconUrl: ch.image_url,
					link: ch.link,
				};
			});

			this.#storage.channel = {
				prefered: channels.find((ch) => ch.type === data.sent_to),
				list: channels,
			};

			this.#loadCookies();
			this.#loadTimers();

			return true;
		}

		return false;
	}

	#loadCookies() {
		if (this.#storage.hasSession()) {
			const expiresIso = new Date(
				this.#storage.session.sessionExpired,
			).toUTCString();

			Storage.setCookie(
				COOKIE_SESSION_ID,
				this.#storage.session.sessionId,
				expiresIso,
			);
		}
	}

	#loadTimers() {
		if (this.#storage.hasSession()) {
			const d = new Date();
			const expires = new Date(this.#storage.session.sessionExpired);
			const seconds = Math.floor((expires - d) / 1000);
			this.#timer.startSessionTimer(seconds);
		}

		for (const ch of this.#storage?.channel?.list || []) {
			if (ch.timeout > 0) {
				this.#timer.startChannelTimer(ch.type, ch.timeout);
			}
		}
	}

	#clear() {
		this.#storage.clear();
		this.#timer.clear();
	}

	#expiredListener() {
		this.#storage.clear();
	}
}
