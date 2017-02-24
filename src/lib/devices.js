"use strict";

const drivers = require("./drivers");
const DeviceDescriptor = require("./DeviceDescriptor.js");

let devices = {};

for (let driverName in drivers) {
	devices[driverName] = new DeviceDescriptor(driverName);
}

module.exports = devices;