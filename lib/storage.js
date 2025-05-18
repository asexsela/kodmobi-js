"use strict";

class Storage {
	#settings;
	#session;
	#channel;

	get settings() {
		return this.#settings ?? null;
	}

	set settings(val) {
		this.#settings = val;
	}

	get session() {
		return this.#session ?? null;
	}

	set session(val) {
		this.#session = val;
	}

	get channel() {
		return this.#channel ?? null;
	}

	set channel(val) {
		this.#channel = val;
	}

	isNewSession(sessionId) {
		const existing = this.#session?.sessionId;

		if (existing === undefined) {
			return true;
		}

		return existing !== sessionId;
	}

	hasSession() {
		return this.#session?.sessionId !== undefined;
	}

	setPrefered(channel) {
		if (this.#channel) {
			this.#channel.prefered = channel;
		}
	}

	static setCookie(name, value, exp) {
		if (typeof document !== "undefined" && document.cookie !== undefined) {
			document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};expires=${exp};path=/;`;
			return true;
		}
		return false;
	}

	static delCookie(name) {
		if (typeof document !== "undefined" && document.cookie !== undefined) {
			document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent("-1")};expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;`;
			return true;
		}
		return false;
	}

	static getCookie(name) {
		if (typeof document !== "undefined" && document.cookie !== undefined) {
			const cookies = document.cookie.split("; ");

			for (const cookie of cookies) {
				const [cookieName, val] = cookie.split("=");
				if (decodeURIComponent(cookieName) === name) {
					return decodeURIComponent(val);
				}
			}
		}

		return null;
	}

	clear() {
		if (typeof document !== "undefined" && document.cookie !== undefined) {
			const prefix = "km-";
			const cookies = document.cookie.split("; ");

			for (const cookie of cookies) {
				const [cookieName, _] = cookie.split("=");
				if (decodeURIComponent(cookieName).startsWith(prefix)) {
					Storage.delCookie(cookieName);
				}
			}
		}

		this.#session = null;
		this.#channel = null;
	}
}

export default Storage;
