"use strict";

const EventEmitter = require("events");
const HID = require("node-hid");
const robot = require("robotjs");
const drivers = require("./drivers");
const utils = require("./utils");
const ListeningDevice = require("./ListeningDevice.js");

let devices = {};
let deviceStates = {};
let hidDevices = {};
let deviceMap = {};

for (let driverName in drivers) {
	devices[driverName] = {
		getInputs: getInputs.bind(getInputs, driverName),
		listen: listen.bind(listen, driverName),
		map: map.bind(map, driverName),
	};
}

function getInputs (driverName) {
	const driver = drivers[driverName];
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
}

function listen (driverName) {
	const driver = drivers[driverName];
	const devName = driver.PRODUCT_NAME||driver.PRODUCT_ID;
	const devVendor = driver.VENDOR_NAME||driver.VENDOR_ID;

	let emitter = new EventEmitter();

	let output = new Promise((resolve, reject) => {
		try {
			const hidListener = new HID.HID(driver.VENDOR_ID, driver.PRODUCT_ID);
			const listeningDevice = new ListeningDevice(hidListener, driverName, emitter);

			storeInitialDeviceState(driverName);
			hidDevices[driverName] = hidListener;
			devices[driverName].emitter = emitter;

			hidListener.on("data", onData.bind(onData, driver, driverName, emitter));
			hidListener.on("error", () => {
				emitter.emit("disconnect",`Device '${devName}' disconnected.`);

				listeningDevice.stop();
				delete devices[driverName].emitter;
				delete hidDevices[driverName];
			});

			resolve(listeningDevice);
		} catch (err) {
			reject(`Device '${devName}' by '${devVendor}' not found.`);
		}
	});

	return output;
}

function storeInitialDeviceState (driverName) {
	let state = {keys: {}};
	const driver = drivers[driverName];

	for (let keyName in driver.KEYS) {
		state.keys[keyName] = driver.KEYS[keyName].defaultValue;
	}

	deviceStates[driverName] = state;
}

function parseDeviceEventData (parsedData, deviceStateHolder) {
	let output = {};

	for (let inputName in parsedData) {
		let inputEvent = parsedData[inputName];
		if (inputEvent.digital != deviceStateHolder.keys[inputName]) {
			if (inputEvent.digital) {
				output[`down.${inputName}`] = inputEvent;
			} else {
				output[`up.${inputName}`] = inputEvent;
			}
			output[inputName] = inputEvent;

			deviceStateHolder.keys[inputName] = inputEvent.digital;
		}
	}

	return output;
}

function map (driverName, deviceInputName, keyboardKeyName) {
	deviceMap[driverName] = deviceMap[driverName]||{};
	deviceMap[driverName][deviceInputName] = keyboardKeyName;
}

function onData (driver, driverName, emitter, rawData) {
	let parsedData = driver.parseData(rawData);

	// BEGIN Deprecated. Remove by 1.0.0 release
	emitter.emit("data", parsedData);
	// END Deprecated

	let deviceStateHolder = deviceStates[driverName];

	let eventData = parseDeviceEventData(parsedData, deviceStateHolder);

	if (deviceMap[driverName]) {
		for (let deviceInputName in deviceMap[driverName]) {
			let keyboardKeyName = deviceMap[driverName][deviceInputName];
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

module.exports = devices;