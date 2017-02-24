"use strict";

const drivers = require("./drivers");

module.exports = ListeningDevice;

function ListeningDevice (hidListener, driverName, emitter) {
	const driver    = drivers[driverName];
	const devName   = driver.PRODUCT_NAME||driver.PRODUCT_ID;
	const devVendor = driver.VENDOR_NAME||driver.VENDOR_ID;

	this.message     = `Device '${devName}' found and connected.`;
	this.device      = hidListener; // this.device is deprecated
	this.hidListener = hidListener;
	this.driverName  = driverName;
	this.emitter     = emitter; // this.emitter is deprecated

	this.productName = devName;
	this.productId   = driver.PRODUCT_ID;
	this.vendorName  = devVendor;
	this.vendorId    = driver.VENDOR_ID;
}

ListeningDevice.prototype.stop = function(){
	if (this.hidListener) {
		this.hidListener.removeAllListeners();
		this.hidListener.close();
	}
	if (this.emitter) { // this.emitter is deprecated
		this.emitter.removeAllListeners();
	}
};