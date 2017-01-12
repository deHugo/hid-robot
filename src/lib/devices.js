"use strict";

const EventEmitter = require("events");
const HID = require("node-hid");
const drivers = require("./drivers");

let devices = {};

for (let driverName in drivers) {
	const driver = drivers[driverName];

	devices[driverName] = {
		getInputs: getInputs.bind(getInputs, driver),
		listen: listen.bind(listen, driver),
	};
}

function getInputs (driver) {
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

function listen (driver) {
	const devName = driver.PRODUCT_NAME||driver.PRODUCT_ID;
	const devVendor = driver.VENDOR_NAME||driver.VENDOR_ID;

	let emitter = new EventEmitter();

	let output = new Promise((resolve, reject) => {
		try {
			const device = new HID.HID(driver.VENDOR_ID, driver.PRODUCT_ID);

			device.on("data", rawData => {
				let parsedData = driver.parseData(rawData);

				emitter.emit("data", parsedData);
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

module.exports = devices;