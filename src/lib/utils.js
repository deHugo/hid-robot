"use strict";

function leftPadZeroes (num, length) {
	num = num.toString();
	let mask = "000";

	return mask.substring(0, length - num.length) + num;
}

function rightPadSpaces (str, length) {
	let mask = "                         ";

	return str + mask.substring(0, length - str.length);
}

function getFormattedUtcTime () {
	let now = new Date();
	let nowHour = leftPadZeroes(now.getUTCHours(), 2);
	let nowMinute = leftPadZeroes(now.getUTCMinutes(), 2);
	let nowSecond = leftPadZeroes(now.getUTCSeconds(), 2);
	let nowMilli = leftPadZeroes(now.getUTCMilliseconds(), 3);

	return `${nowHour}:${nowMinute}:${nowSecond}.${nowMilli}`;
}

function getConfig () {
	const DEFAULTS = {
		debug: false
	};

	let options = {};

	if (process.argv.indexOf("--debug") >= 0) {
		options.debug = true;
	}

	let config = Object.assign({}, DEFAULTS, options);

	return config;
}

module.exports = {
	getConfig,
	getFormattedUtcTime,
	leftPadZeroes,
	rightPadSpaces
};