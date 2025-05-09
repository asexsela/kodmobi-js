"use strict";

export default class Event {
	#events = {};

	on(event, listener) {
		if (this.#events[event] === undefined) {
			this.#events[event] = [];
		}
		this.#events[event].push(listener);
		return this;
	}

	once(event, listener) {
		const onceWrapper = (...args) => {
			this.off(event, onceWrapper);
			listener(...args);
		};
		this.on(event, onceWrapper);
		return this;
	}

	off(event, listener) {
		if (this.#events[event] !== undefined) {
			this.#events[event] = this.#events[event].filter(
				(fn) => fn !== listener,
			);
		}
	}

	emit(event, ...args) {
		if (this.#events[event] !== undefined) {
			this.#events[event].forEach((fn) => fn(...args));
		}
	}
}
