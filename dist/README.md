# @kodmobi/kodmobi-js

![NPM Version](https://badgen.net/npm/v/@kodmobi/kodmobi-js) ![NPM Downloads](https://badgen.net/npm/dm/@kodmobi/kodmobi-js) ![License](https://badgen.net/npm/license/@kodmobi/kodmobi-js) ![Bundlephobia minzip](https://badgen.net/bundlephobia/minzip/@kodmobi/kodmobi-js) ![Types](https://badgen.net/npm/types/@kodmobi/kodmobi-js) ![GitHub stars](https://badgen.net/github/stars/asexsela/kodmobi-js)

A simple JavaScript wrapper for the [kod.mobi](https://kod.mobi) HTTP API.
This package makes it easy to integrate kod.mobi into your web projects.

## SRI

- `sha384-geiIUaB5eno4JP4N2a4n3BC6jTWbnrMcNxAedYS2gq23wAdSfg344OxM2fOlOupO`

## Installation

```bash
npm install @kodmobi/kodmobi-js
```

```html
<!-- <script src="https://unpkg.com/@kodmobi/kodmobi-js integrity="sha384-geiIUaB5eno4JP4N2a4n3BC6jTWbnrMcNxAedYS2gq23wAdSfg344OxM2fOlOupO" crossorigin="anonymous""></script> -->
<script
	src="https://unpkg.com/@kodmobi/kodmobi-js@v0.1.21"
	integrity="sha384-geiIUaB5eno4JP4N2a4n3BC6jTWbnrMcNxAedYS2gq23wAdSfg344OxM2fOlOupO"
	crossorigin="anonymous"
></script>

<script>
	const km = new kodmobi.Kodmobi("API_KEY");
</script>
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

// optional
// change api key later (hot update)
kod.setApiKey("YOUR_API_KEY")

// get settings
const settings = kod.settings;

// create session for "to" (phone/email) and send code flag as second parameter
// prefered - prefered user channels
// channels - all available channels
const { prefered, list } = await kod.create(to, true);

// get session info
const channel = kod.session;
// get prefered (in active session)
const channel = kod.prefered;
// get available channels (for currenct user)
const channels = await kod.channels();
// get user destination (phone/email)
const destination = kod.destination;

// send code to speciefic channels
// return bool
const send = await kod.send(channel);

// check user code
// setVerifyCallback - also uses in this step behinde the scene
const { success, isVerified, data } = await kod.check(code);


km.once("ready", async ({
	isNewSession,
	settings,
	preferedChannel,
	sessionChannels,
	destination,
	session,
	setVerifyCallback,
	getChannels,
	create,
	send,
	check
}) => {
	// do something
});

km.on("session:created", ({prefered, list}) => {
	// do something
});

km.on("session:loaded", ({prefered, list}) => {
	// do something
});

km.on("session:expired", () => {
	// do something
});

km.on("session:success", (data) => {
	// data your data from verification callback
	// do something
});

km.on("error", ({message, hint, sysMessage}) => {
	// message - error message
	// hint - helper message
	// sysMessage - constant
	// do something
});

```

### API

- `settings`: Get settings
- `preferedChannel`: Get preferred/last channel
- `sessionChannels`: Get available channels per session
- `destination`: Get destination
- `session`: Get session info
- `getChannels()`: Fetch available channels
- `create(to, send)`: Create a session
- `send(channel)`: Send a message
- `check(code)`: Check a code
- `setVerifyCallback(cb)`: Set a verification callback
- `setApiKey(apiKey)`: Set an API key

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
