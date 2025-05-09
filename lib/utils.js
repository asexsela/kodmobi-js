"use strict";

export function parseHintByErr(systemError) {
	switch (systemError) {
		case "ERROR_PROJECT_HAS_NO_CHANNELS":
			return "Let's try to enable some channels on the dashboard.";
		case "ERROR_PROJECT_HAS_NO_CHANNEL":
			return "Try to enable this channel on the dashboard.";
		case "ERROR_USER_NOT_AUTHORIZE_ON_CHANNEL":
			return "Try to authorize on the channel. Use link of the channel object.";
		case "ERROR_SESSION_EXPIRED":
			return "Try to use create() method again";
		case "ERROR_MESSAGE_WRONG_CODE":
			return "If you continue to enter incorrect codes, you will be blocked!";
		case "ERROR_CHANNEL_NOT_ALLOWED_COUNTRY":
			return "This channel, I think sms, does not allowed your cauntry. Try another one or setup this channel on the dashboard.";
		case "ERROR_MESSAGE_ATTEMPT":
			return "Relax, take your time";
		case "ERROR_PHONE_BLOCKED":
		case "ERROR_BLOCKED":
			return "Do not enter the wrong code!";
		case "ERROR_CHALLENGE":
			return "Check you chanllenge settings.";
		case "ERROR_BAD_REQUEST":
			return "Check your input.";
		case "ERROR_WRONG_BALANCE":
			return "Check your balance on the dashboard.";
		case "ERROR_ACCESS_DENIED":
			return "Check your api key twice.";
		default:
			return null;
	}
}
