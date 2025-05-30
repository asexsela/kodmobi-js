"use strict";

import { EVENT_SESSION_EXPIRED, PROD_V2, EVENT_ERROR } from "./constants.js";
import Logger from "./log.js";
import { parseHintByErr } from "./utils.js";

class Api {
	#apiKey;
	#baseUrl;
	#emit;

	constructor(apiKey, baseUrl, emit) {
		this.#emit = emit;
		this.#apiKey = apiKey;
		this.#baseUrl = baseUrl || PROD_V2;
	}

	setApiKey(apiKey) {
		this.#apiKey = apiKey;
	}

	setBaseUrl(baseUrl) {
		this.#baseUrl = baseUrl || PROD_V2;
	}

	async getSettings(sessionId) {
		return this.#send(`/settings?session_id=${sessionId || ""}`, "GET");
	}

	async getChannels(sessionId) {
		return this.#send(`/channels?session_id=${sessionId || ""}`, "GET");
	}

	async createSession(to, send) {
		if (typeof send !== "boolean") {
			send = false;
		}
		return this.#send(`/create`, "POST", { to, send });
	}

	async sendCode(sessionId, channel) {
		return this.#send(`/send`, "POST", {
			session_id: sessionId,
			type: channel,
		});
	}

	async checkCode(sessionId, code) {
		return this.#send(`/check`, "POST", { session_id: sessionId, code });
	}

	async #send(path, method, body) {
		try {
			const headers = new Headers();
			headers.append("Content-Type", "application/json");
			headers.append("Accept", "application/json");
			headers.append("x-api-key", this.#apiKey);

			// const url = new URL(path, this.#baseUrl);

			const request = new Request(`${this.#baseUrl}${path}`, {
				baseUrl: this.#baseUrl,
				method,
				body: body ? JSON.stringify(body) : undefined,
				headers,
				mode: "cors",
			});

			const response = await fetch(request);
			const json = await response.json();

			if (response.status < 200 || response.status >= 300) {
				throw json;
			}

			return { ok: true, data: json };
		} catch (err) {
			const text = err?.message || err?.error?.toString();
			const sysMessage = err?.sys_message || "ERROR_ACCESS_DENIED";
			const hint = parseHintByErr(sysMessage);

			if (sysMessage === "ERROR_SESSION_EXPIRED") {
				this.#emit(EVENT_SESSION_EXPIRED);
			}

			this.#emit(EVENT_ERROR, {
				message: text,
				hint,
				sysMessage,
			});

			Logger.error(text, hint);
			return { ok: false, reason: text };
		}
	}
}

export default Api;
