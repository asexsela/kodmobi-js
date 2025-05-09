"use strict";

class Logger {
	static welcome() {
		console.log(
			"\x1b[36m🚀 @kodmobi/kodmobi-js\x1b[0m | " +
				"\x1b[32mDashboard:\x1b[0m https://user.kod.mobi | " +
				"\x1b[33mPostman:\x1b[0m https://documenter.getpostman.com/view/7795553/2sAXjKaYFf | " +
				"\x1b[35mNPM:\x1b[0m https://npmjs.com/package/@kodmobi/kodmobi-js | " +
				"\x1b[34mSupport: https://t.me/@kodmobisupport_bot\x1b[0m",
		);
	}

	static success(msg) {
		console.log(`\x1b[32m✔️ Success:\x1b[0m ${msg}`);
	}

	static warn(msg) {
		console.log(`\x1b[33m⚠️ Warning:\x1b[0m ${msg}`);
	}

	static info(msg) {
		console.log(`\x1b[36mℹ️ Info:\x1b[0m ${msg}`);
	}

	static error(err, hint) {
		let msg = `\x1b[31m❌ Error:\x1b[0m ${err?.toString() || err}`;

		if (hint) {
			msg =
				msg +
				" | " +
				`\x1b[33mℹ️ Hint:\x1b[0m ${hint.toString() || hint}`;
		}

		console.log(msg);
	}
}

export default Logger;
