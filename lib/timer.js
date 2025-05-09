"use strict";

import {
	EVENT_CHANNEL_TIMER,
	EVENT_SESSION_EXPIRED,
	EVENT_SESSION_TIMER,
} from "./constants.js";

class Timer {
	#emit;

	#sessionIntervalId;
	#channelIntervalIds;

	constructor(emit) {
		this.#emit = emit;
		this.#channelIntervalIds = new Map();
	}

	startSessionTimer(seconds) {
		if (!this.#sessionIntervalId) {
			this.#sessionIntervalId = setInterval(() => {
				this.#emit(EVENT_SESSION_TIMER, { left: seconds });
				if (seconds <= 0) {
					this.#emit(EVENT_SESSION_EXPIRED);
					clearInterval(this.#sessionIntervalId);
					this.#sessionIntervalId = null;
					return;
				}
				seconds--;
			}, 1000);
		}
	}

	startChannelTimer(channel, seconds) {
		if (!this.#channelIntervalIds.has(channel)) {
			const intervalId = setInterval(() => {
				this.#emit(EVENT_CHANNEL_TIMER, { left: seconds, channel });
				if (seconds <= 0) {
					clearInterval(intervalId);
					this.#channelIntervalIds.delete(channel);
					return;
				}
				seconds--;
			}, 1000);

			this.#channelIntervalIds.set(channel, intervalId);
		}
	}

	clear() {
		if (this.#sessionIntervalId) {
			clearInterval(this.#sessionIntervalId);
			this.#sessionIntervalId = null;
		}

		for (const intervalId of this.#channelIntervalIds.values()) {
			clearInterval(intervalId);
			this.#channelIntervalIds.clear();
		}
	}
}

export default Timer;
