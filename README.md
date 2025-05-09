# @kodmobi/kodmobi-js

![NPM Version](https://badgen.net/npm/v/@kodmobi/kodmobi-js) ![NPM Downloads](https://badgen.net/npm/dm/@kodmobi/kodmobi-js) ![License](https://badgen.net/npm/license/@kodmobi/kodmobi-js) ![Bundlephobia minzip](https://badgen.net/bundlephobia/minzip/@kodmobi/kodmobi-js) ![Types](https://badgen.net/npm/types/@kodmobi/kodmobi-js) ![GitHub stars](https://badgen.net/github/stars/asexsela/kodmobi-js)

A simple JavaScript wrapper for the [kod.mobi](https://kod.mobi) HTTP API.
This package makes it easy to integrate kod.mobi into your web projects.

## Installation

```bash
npm install @kodmobi/kodmobi-js
```

## Usage

```js
import { Kodmobi } from "@kodmobi/kodmobi-js";

const kod = new Kodmobi("YOUR_API_KEY");

// optional
// may be async
km.setVerifyCallback((verifyToken) {
	// server verification may be here
	// return ok(bool) and data(optional)
	return { ok: false, data: { access_token: "1234", refresh_token: "3345" } };
});


km.once("ready", async () => {
	// get settings
	const settings = kod.settings;

	// create session for "to" (phone/email) and send code flag as second parameter
	// prefered - prefered user channels
	// channels - all available channels
	const { prefered, list } = await kod.create(to, true);

	// get prefered (in active session)
	const channel = kod.prefered;
	// get available channels (for currenct user)
	const channels = kod.channels;
	// get user destination (phone/email)
	const destination = kod.destination;

	// send code to speciefic channels
	// return bool
	const send = await kod.send(channel);

	// check user code
	// setVerifyCallback - also uses in this step behinde the scene
	const { success, isVerified, data } = await kod.check(code);
});


function drawEnterCodeContainer({ prefered, list }) {
	// do something
}

function drawEnterLoginContainer() {
	// do something
}

function redirectToProfile(data) {
	// data your data from verification callback
	// do something
}

function showError({message, hint, sysMessage}) {
	// message - error message
	// hint - helper message
	// sysMessage - constant
	// do something
}

km.on("session:created", drawEnterCodeContainer);
km.on("session:loaded", drawEnterCodeContainer);
km.on("session:expired", drawEnterLoginContainer);
km.on("session:success", redirectToProfile);
km.on("error", showError);

```

### API

- `settings`: Get settings
- `prefered`: Get preferred channel
- `channels`: Get available channels
- `destination`: Get destination
- `create(to, send)`: Create a session
- `send(channel)`: Send a message
- `check(code)`: Check a code
- `setVerifyCallback(cb)`: Set a verification callback

### Events

- `ready`: Triggered when setting was loaded.
- `session:created`: Triggered when a new session is created.
- `session:expired`: Triggered when the session has expired.
- `session:loaded`: Triggered when session data has been successfully loaded.
- `session:success`: Fires when the code check (and verification) is successfully completed.
- `session:timer`: Countdown until session expiration (every seconds).
- `channel:timer` Countdown to unlocking a specific channel (every seconds)
- `error`: Any errors kodmobi/internal...

## Types

TypeScript definitions are included.

## License

MIT
