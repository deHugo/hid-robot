"use strict";

const HID = require("node-hid");
const robot = require("robotjs");
const controller = require("../drivers/nimbus");
const events = require("../events");

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
	let screenPos = translateAnalogSticksToPercentages("STICK_2_AXIS_X", "STICK_2_AXIS_Y", parsedData);
	robot.moveMouse(screenPos.x, screenPos.y);
	events.parser(parsedData);
	this.read(this.gotData.bind(this));
};

hid.read(hid.gotData.bind(hid));

const controllerEvents = events.emitter;

const map = {
	D_PAD_1_UP: bindKey("w"),
	D_PAD_1_RIGHT: bindKey("d"),
	D_PAD_1_DOWN: bindKey("s"),
	D_PAD_1_LEFT: bindKey("a"),
	BUTTON_1_A: bindKey("space"),
	BUTTON_2_B: bindMouseButton("right"),
	BUTTON_3_X: bindMouseButton("left"),
	BUTTON_5_L1: bindMouseButton("left"),
	BUTTON_7_L2: bindKey("o"),
	BUTTON_8_R2: bindKey("p"),
	BUTTON_9_MENU: bindKey("q"),
};
function bindKey (key) {
	return val => {
		if (val) robot.keyToggle(key, "down");
		else robot.keyToggle(key, "up");
	};
}
function bindMouseButton (button) {
	return val => {
		if (val) robot.mouseToggle("down", button);
		else robot.mouseToggle("up", button);
	};
}

function translateValue (val, curRangeMin, curRangeMax, newRangeMin, newRangeMax) {
	let curRange = curRangeMin-curRangeMax;
	let curPercent = (val - curRangeMin) / curRange;
	let newRange = newRangeMin-newRangeMax;
	let newVal = (curPercent*newRange)+newRangeMin;

	return newVal;
}

function translateAnalogSticksToPercentages (nameAxisX,nameAxisY, data) {
	let screenSize = robot.getScreenSize();

	let stickX = data[nameAxisX].analog;
	let xMin = controller.KEYS[nameAxisX].valueRange[0];
	let xMax = controller.KEYS[nameAxisX].valueRange[1];
	let screenX = translateValue(stickX, xMin, xMax, 0, screenSize.width);

	let stickY = data[nameAxisY].analog;
	let yMin = controller.KEYS[nameAxisY].valueRange[0];
	let yMax = controller.KEYS[nameAxisY].valueRange[1];
	let screenY = translateValue(stickY, yMin, yMax, screenSize.height, 0);

	return {x: screenX, y: screenY};
}

for (let button in map) {
	controllerEvents.on(button, data => {
		map[button](data.digital);
	});
}