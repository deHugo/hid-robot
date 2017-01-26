"use strict";

const HID = require("node-hid");
const compatibleDevices = require("./devices");

const SCAN_INTERVAL = 1000;

const EVENTS = {
	DEVICE_ADD: "device-add",
	DEVICE_REMOVE: "device-remove"
};

let connectedDevices = new WeakSet();
let addScanner
let removeScanner

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
	if (removeScanner) {
		clearInterval(removeScanner)
	}
}

function disconnectDevice (device) {
	if (connectedDevices.has(device)) {
		connectedDevices.delete(device);
	}
	if (addScanner) {
		clearInterval(addScanner)
	}
}

function on (eventName, filter, callback) {
	if (eventName === EVENTS.DEVICE_ADD) {
		return onDeviceAdded.call(onDeviceAdded, filter, callback)
	} else if (eventName === EVENTS.DEVICE_REMOVE) {
		return onDeviceRemoved.call(onDeviceRemoved, filter, callback)
	} else {
		return false;
	}
}

function onDeviceAdded (filter, callback) {
	addScanner = setInterval(() => {
		HID.devices().forEach(device => {
			let match = false;

			for (let compatibleDeviceName in compatibleDevices) {
				let compatibleDevice = compatibleDevices[compatibleDeviceName];

				match = device.vendorId === compatibleDevice.vendorId && device.productId === compatibleDevice.productId && !connectedDevices.has(compatibleDevice);
				if (match) {
					connectDevice(compatibleDevice);
					callback(compatibleDevice);
					break;
				}
			}
		});
	}, SCAN_INTERVAL);
}

function onDeviceRemoved (filter, callback) {
	removeScanner = setInterval(() => {
		HID.devices().forEach(device => {
			let match = false;

			for (let compatibleDeviceName in compatibleDevices) {
				let compatibleDevice = compatibleDevices[compatibleDeviceName];

				match = device.vendorId === compatibleDevice.vendorId && device.productId === compatibleDevice.productId && connectedDevices.has(compatibleDevice);
				if (match) {
					disconnectDevice(compatibleDevice);
					callback(compatibleDevice);
					break;
				}
			}
		});
	}, SCAN_INTERVAL);
}

module.exports = { on, onDeviceAdded, onDeviceRemoved };