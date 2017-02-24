"use strict";

const drivers         = require("./drivers");
const EventEmitter    = require("events");
const HID             = require("node-hid");
const ListeningDevice = require("./ListeningDevice.js");
const robot           = require("robotjs");
const utils           = require("./utils");

module.exports = DeviceDescriptor;

let hidListener = null;
let keyMappings = {};
let state = {keys: {}};

function DeviceDescriptor (driverName) {
	this.driverName = driverName;

	this.driver     = drivers[this.driverName];
	this.emitter    = new EventEmitter(); // this.emitter is deprecated
	this.name       = this.driver.PRODUCT_NAME||this.driver.PRODUCT_ID;
	this.vendor     = this.driver.VENDOR_NAME||this.driver.VENDOR_ID;

	for (let keyName in this.driver.KEYS) {
		state.keys[keyName] = this.driver.KEYS[keyName].defaultValue;
	}
}

DeviceDescriptor.prototype.getInputs = function(){
	const driver = drivers[this.driverName];
	let inputs = {};

	for (let key in driver.KEYS) {
		inputs[key] = {
			label:        driver.KEYS[key].label,
			type:         driver.KEYS[key].type,
			defaultValue: driver.KEYS[key].defaultValue,
			valueRange:   driver.KEYS[key].valueRange,
		};
	}

	return inputs;
};

DeviceDescriptor.prototype.listen = function(){
	return new Promise((resolve, reject) => {
		try {
			hidListener = new HID.HID(this.driver.VENDOR_ID, this.driver.PRODUCT_ID);
			const listeningDevice = new ListeningDevice(hidListener, this.driverName, this.emitter);

			hidListener.on("data", onData.bind(onData, this.driverName, this.emitter));
			hidListener.on("error", () => {
				this.emitter.emit("disconnect",`Device '${this.name}' disconnected.`);

				listeningDevice.stop();
				hidListener = null;
			});

			resolve(listeningDevice);
		} catch (err) {
			reject(`Device '${this.name}' by '${this.vendor}' not found.`);
		}
	});
};

DeviceDescriptor.prototype.map = function(deviceInputName, keyboardKeyName) {
	keyMappings[deviceInputName] = keyboardKeyName;
};

function onData (driverName, emitter, rawData) {
	const driver = drivers[driverName];
	const parsedData = driver.parseData(rawData);

	// BEGIN Deprecated. Remove by 1.0.0 release
	emitter.emit("data", parsedData);
	// END Deprecated

	let eventData = parseDeviceEventData(parsedData);

	if (Object.keys(keyMappings).length) {
		for (let deviceInputName in keyMappings) {
			let keyboardKeyName = keyMappings[deviceInputName];

			if (eventData[`up.${deviceInputName}`]) {
				logDataEvent("up", deviceInputName, keyboardKeyName);
				robot.keyToggle(keyboardKeyName, "up");
			} else if (eventData[`down.${deviceInputName}`]) {
				logDataEvent("     down", deviceInputName, keyboardKeyName);
				robot.keyToggle(keyboardKeyName, "down");
			}
		}
	}
}

function logDataEvent (dir, deviceInputName, keyboardKeyName) {
	if (utils.getConfig().debug) {
		console.log(`${utils.getFormattedUtcTime()} ${utils.rightPadSpaces(deviceInputName, 15)}${utils.rightPadSpaces(dir, 15)}${keyboardKeyName}`);
	}
}

function parseDeviceEventData (parsedData) {
	let output = {};

	for (let inputName in parsedData) {
		let inputEvent = parsedData[inputName];
		if (inputEvent.digital != state.keys[inputName]) {
			if (inputEvent.digital) {
				output[`down.${inputName}`] = inputEvent;
			} else {
				output[`up.${inputName}`] = inputEvent;
			}
			output[inputName] = inputEvent;

			state.keys[inputName] = inputEvent.digital;
		}
	}

	return output;
}