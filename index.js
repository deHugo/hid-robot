"use strict";

const HID = require("node-hid");
const controller = require("./src/lib/nimbus");

const hid = new HID.HID(controller.VENDOR_ID, controller.PRODUCT_ID);

hid.gotData = function (err, data) {
	if (err) {
		console.error(err);
		process.exit();
	} else if (!data) {
		console.log("device disconnected");
		process.exit();
	}
	console.log(controller.parseData(data));
	this.read(this.gotData.bind(this));
};

hid.read(hid.gotData.bind(hid));