"use strict";

const HID = require("node-hid");
const robot = require("robotjs");
const drivers = require("./src/lib/drivers");
const events = require("./src/lib/events");

for (let driverName in drivers) {
	const driver = drivers[driverName];

	const devName = driver.PRODUCT_NAME||driver.PRODUCT_ID;
	const devVendor = driver.VENDOR_NAME||driver.VENDOR_ID;

	let gotDataErr = null;

	try {
		const device = new HID.HID(driver.VENDOR_ID, driver.PRODUCT_ID);

		device.gotData = function (err, data) {
			if (err) {
				console.error(err);
				gotDataErr = err;
			} else if (!data) {
				console.log(`Device '${devName}' disconnected.`);
				gotDataErr = 'Device disconnected';
			}

			if (driver.parseData) {
				let parsedData = driver.parseData(data);
				console.log(parsedData);
			} else {
				console.log(data)
			}

			if (gotDataErr) {
				this.pause();
			} else {
				this.read(this.gotData.bind(this));
			}
		};

		device.read(device.gotData.bind(device));

		console.log(`Device '${devName}' found and connected.`);
	} catch (err) {
		console.log(`Device '${devName}' by '${devVendor}' not found.`);
	}
}