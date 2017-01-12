"use strict";

const EventEmitter = require("events");
const HID = require("node-hid");
const drivers = require("./drivers");

let devices = {};
let deviceStates = {};

for (let driverName in drivers) {
	const driver = drivers[driverName];

	devices[driverName] = {
		getInputs: getInputs.bind(getInputs, driverName),
		listen: listen.bind(listen, driverName),
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
			const device = new HID.HID(driver.VENDOR_ID, driver.PRODUCT_ID);
			storeInitialDeviceState(driverName);

			device.on("data", rawData => {
				let parsedData = driver.parseData(rawData);

				emitter.emit("data", parsedData);
				let deviceStateHolder = deviceStates[driverName]
				emitIndividualDeviceInputEvents(parsedData, deviceStateHolder, emitter)
			});

			device.on("error", err => {
				emitter.emit("disconnect",`Device '${devName}' disconnected.`);

				device.close();
			});

			resolve({emitter, message:`Device '${devName}' found and connected.`});
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

function emitIndividualDeviceInputEvents (parsedData, deviceStateHolder, emitter) {
	for (let inputName in parsedData) {
		let inputEvent = parsedData[inputName]
		if (inputEvent.digital != deviceStateHolder.keys[inputName]) {
			if (inputEvent.digital) {
				emitter.emit(`up.${inputName}`, inputEvent)
			} else {
				emitter.emit(`down.${inputName}`, inputEvent)
			}
			emitter.emit(inputName, inputEvent)

			deviceStateHolder.keys[inputName] = inputEvent.digital
		}
	}
}

module.exports = devices;