"use strict";

const EventEmitter = require("events");
const HID = require("node-hid");
const robot = require("robotjs");
const drivers = require("./drivers");

let devices = {};
let deviceStates = {};

for (let driverName in drivers) {
	devices[driverName] = {
		getInputs: getInputs.bind(getInputs, driverName),
		listen: listen.bind(listen, driverName),
		map: map.bind(map, driverName),
		vendorId: drivers[driverName].VENDOR_ID,
		productId: drivers[driverName].PRODUCT_ID,
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

function stop (device, emitter) {
	if (device) {
		device.removeAllListeners();
		device.close();
	}
	if (emitter) {
		emitter.removeAllListeners();
	}
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
				let deviceStateHolder = deviceStates[driverName];
				emitIndividualDeviceInputEvents(parsedData, deviceStateHolder, emitter);
			});

			device.on("error", () => {
				emitter.emit("disconnect",`Device '${devName}' disconnected.`);

				stop(device, emitter);
				delete devices[driverName].emitter;
			});

			devices[driverName].emitter = emitter;

			resolve({
				emitter,
				message: `Device '${devName}' found and connected.`,
				stop: stop.bind(stop, device, emitter),
				driverName,
				productName: devName,
				productId: driver.PRODUCT_ID,
				vendorName: devVendor,
				vendorId: driver.VENDOR_ID
			});
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
		let inputEvent = parsedData[inputName];
		if (inputEvent.digital != deviceStateHolder.keys[inputName]) {
			if (inputEvent.digital) {
				emitter.emit(`down.${inputName}`, inputEvent);
			} else {
				emitter.emit(`up.${inputName}`, inputEvent);
			}
			emitter.emit(inputName, inputEvent);

			deviceStateHolder.keys[inputName] = inputEvent.digital;
		}
	}
}

function map (driverName, deviceInputName, keyboardKeyName) {
	let emitter = devices[driverName].emitter;

	if (emitter) {
		emitter.on(`up.${deviceInputName}`, () => robot.keyToggle(keyboardKeyName, "up"));
		emitter.on(`down.${deviceInputName}`, () => robot.keyToggle(keyboardKeyName, "down"));
	}
}

module.exports = devices;