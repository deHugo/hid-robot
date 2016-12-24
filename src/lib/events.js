"use strict";

const EventEmitter = require("events");

let state = {};

let emitter = new EventEmitter();

module.exports = {
	parser: data => {
		let newState = Object.assign({}, state, data);
		let keys = Object.keys(newState);

		for (let key of keys) {
			if (state[key] && newState[key].analog !== state[key].analog) emitter.emit(key, newState[key]);
		}

		state = newState;
	},
	emitter: emitter
};