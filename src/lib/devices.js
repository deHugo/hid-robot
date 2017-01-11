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

	let gotDataErr = null;

	let emitter = new EventEmitter();

	let output = new Promise((resolve, reject) => {
		try {
			const device = new HID.HID(driver.VENDOR_ID, driver.PRODUCT_ID);

			device.gotData = function (err, data) {
				if (err) {
					gotDataErr = err;
					emitter.emit("disconnect",`Device '${devName}' disconnected.`);
					reject(err);
				} else {
					let parsedData = driver.parseData(data);

					emitter.emit("data", parsedData);
				}

				if (gotDataErr) {
					this.pause();
				} else {
					this.read(this.gotData.bind(this));
				}
			};

			device.read(device.gotData.bind(device));

			resolve({emitter, message:`Device '${devName}' found and connected.`});
		} catch (err) {
			reject(`Device '${devName}' by '${devVendor}' not found.`);
		}
	});

	return output;
}

module.exports = devices;