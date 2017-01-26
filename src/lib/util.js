"use strict";

Set.prototype.difference = Set.prototype.difference||function(setB) {
	let difference = new Set(this);

	for (let elem of setB) {
		difference.delete(elem);
	}

	return difference;
};

const HID = require("node-hid");
const compatibleDevices = require("./devices");

const SCAN_INTERVAL = 1000;

const EVENTS = {
	DEVICE_ADD: "device-add",
	DEVICE_REMOVE: "device-remove"
};

let connectedDevices = new Set();
let addScanner;
let removeScanner;

/**
 * From https://developer.chrome.com/apps/hid
 * Attempt to make this module match functionalied of the Chrome HID API
 *
 * Types
 * 	HidDeviceInfo
 * 	DeviceFilter
 * Methods
 * 	getDevices − chrome.hid.getDevices(object options, function callback)
 * 	getUserSelectedDevices − chrome.hid.getUserSelectedDevices(object options, function callback)
 * 	connect − chrome.hid.connect(integer deviceId, function callback)
 * 	disconnect − chrome.hid.disconnect(integer connectionId, function callback)
 * 	receive − chrome.hid.receive(integer connectionId, function callback)
 * 	send − chrome.hid.send(integer connectionId, integer reportId, ArrayBuffer data, function callback)
 * 	receiveFeatureReport − chrome.hid.receiveFeatureReport(integer connectionId, integer reportId, function callback)
 * 	sendFeatureReport − chrome.hid.sendFeatureReport(integer connectionId, integer reportId, ArrayBuffer data, function callback)
 * Events
 * 	onDeviceAdded
 * 	onDeviceRemoved
 */


function connectDevice (device) {
	if (!connectedDevices.has(device)) {
		connectedDevices.add(device);
	}
}

function disconnectDevice (device) {
	if (connectedDevices.has(device)) {
		connectedDevices.delete(device);
	}
}

function on (eventName, filter, callback) {
	if (eventName === EVENTS.DEVICE_ADD) {
		return onDeviceAdded.call(onDeviceAdded, filter, callback);
	} else if (eventName === EVENTS.DEVICE_REMOVE) {
		return onDeviceRemoved.call(onDeviceRemoved, filter, callback);
	} else {
		return false;
	}
}

function onDeviceAdded (filter, callback) {
	addScanner = setInterval(() => {
		HID.devices().forEach(device => {
			for (let compatibleDeviceName in compatibleDevices) {
				let compatibleDevice = compatibleDevices[compatibleDeviceName];
				if (device.vendorId === compatibleDevice.vendorId && device.productId === compatibleDevice.productId) {
					if (!connectedDevices.has(compatibleDevice)) {
						connectDevice(compatibleDevice);
						callback(compatibleDevice);
					}
					break;
				}
			}
		});
	}, SCAN_INTERVAL);
}

function onDeviceRemoved (filter, callback) {
	removeScanner = setInterval(() => {
		let currentlyConnectedDevices = new Set(HID.devices().filter(device => {
			let match = false;

			for (let compatibleDeviceName in compatibleDevices) {
				let compatibleDevice = compatibleDevices[compatibleDeviceName];

				if (device.vendorId === compatibleDevice.vendorId && device.productId === compatibleDevice.productId) {
					match = true;
					break;
				}
			}

			return match;
		}).map(device => {
			let compatibleDevice;

			for (let compatibleDeviceName in compatibleDevices) {
				compatibleDevice = compatibleDevices[compatibleDeviceName];

				if (device.vendorId === compatibleDevice.vendorId && device.productId === compatibleDevice.productId) {
					break;
				}
			}

			return compatibleDevice;
		}));

		let notConnectedDevices = connectedDevices.difference(currentlyConnectedDevices);

		notConnectedDevices.forEach(notConnectedDevice => {
			disconnectDevice(notConnectedDevice);
			callback(notConnectedDevice);
		});
	}, SCAN_INTERVAL);
}

module.exports = { on, onDeviceAdded, onDeviceRemoved };