"use strict";

const HID = require("node-hid");
const robot = require("robotjs");
const controller = require("./src/lib/infinity-pedal");
const events = require("./src/lib/events");

const hid = new HID.HID(controller.VENDOR_ID, controller.PRODUCT_ID);

hid.gotData = function (err, data) {
	if (err) {
		console.error(err);
		process.exit();
	} else if (!data) {
		console.log("device disconnected");
		process.exit();
	}
	let parsedData = controller.parseData(data);
	console.log(parsedData);
	// console.log(data)

	this.read(this.gotData.bind(this));
};

hid.read(hid.gotData.bind(hid));
