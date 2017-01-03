/*
 * data is 48-byte Buffer with byte values:
 * index- info
 *  00  - unknown 0x01
 *  01  - unknown 0x00
 *  02  - start, select, dpad digital bitfield (see data[14]-[17] for analog values)
 *  03  - action button, shoulder, triggers digital bitfield (see data[18]-[25] for analog values)
 *  04  - playstation button
 *  05  -
 *  06  - left joystick analog left-right
 *  07  - left joystick analog up-down
 *  08  - right joystick analog left-right
 *  09  - right joystick analog up-down
 *  10,11,12,13 - unknown 0x00
 *  14  - dpad    up analog pressure
 *  15  - dpad right analog pressure
 *  16  - dpad  down analog pressure
 *  17  - dpad  left analog pressure
 *  18  - left  trigger analog pressure
 *  19  - right trigger analog pressure
 *  20  - left shoulder analog pressure
 *  21  - right shoulder analog pressure
 *  22  - triangle action analog pressure
 *  23  - cicle    action analog pressure
 *  24  - X        action analog pressure
 *  25  - square   action analog pressure
 *  26,27,28
 *  29  - charge state
 *  30  - connection type
 *  31,32,33,34,35,36,37,38,39
 *  40,41 - X-axis accelerometer
 *  42,43 - Y-axis accelerometer
 *  44,45 - Z-axis accelerometer
 *  46,47 - Z-axis gyro
 */
// from: https://github.com/ribbotson/USB-Host/blob/master/ps3/PS3USB/ps3_usb.h
// from: https://code.google.com/p/openaxis/

function ps3Button (analogByteIndex, digitalByteIndex, digitalByteMask) {
	return buf => {
		let output = {digital:false,analog:0};

		output.digital = Boolean(buf[digitalByteIndex]&digitalByteMask);
		output.analog = buf[analogByteIndex];

		return output;
	};
}

function ps3DigitalButton (digitalByteIndex, digitalByteMask) {
	let parsed = ps3Button(0, digitalByteIndex, digitalByteMask);

	parsed.analog = Math.sign(parsed.digital);

	return parsed;
}

function ps3Stick (xAnalogByteIndex, yAnalogByteIndex) {
	return buf => {
		let output = {digital:{x:0,y:0},analog:{x:0,y:0}};
		output.digital.x = Math.sign(buf.readInt8(xAnalogByteIndex, true));
		output.analog.x = buf[xAnalogByteIndex].toString(2);
		output.digital.y = Math.sign(buf.readInt8(yAnalogByteIndex, true));
		output.analog.y = buf[yAnalogByteIndex].toString(2);

		return output;
	};
}

const KEYS = {
	STICK_LEFT: {
		label: "Left Stick",
		type: "Stick",
		parseData: ps3Stick(6, 7)
	},
	STICK_RIGHT: {
		label: "Right Stick",
		type: "Stick",
		parseData: ps3Stick(8, 9)
	},
	D_PAD_1_UP: {
		label: "D-Pad Up",
		type: "D-Pad",
		parseData: ps3Button(14, 2, 0x10)
	},
	D_PAD_1_RIGHT: {
		label: "D-Pad Right",
		type: "D-Pad",
		parseData: ps3Button(15, 2, 0x20)
	},
	D_PAD_1_DOWN: {
		label: "D-Pad Down",
		type: "D-Pad",
		parseData: ps3Button(16, 2, 0x40)
	},
	D_PAD_1_LEFT: {
		label: "D-Pad Left",
		type: "D-Pad",
		parseData: ps3Button(17, 2, 0x80)
	},
	BUTTON_SELECT: {
		label: "Select",
		type: "Button",
		parseData: ps3DigitalButton(2, 0x01)
	},
	BUTTON_START: {
		label: "Start",
		type: "Button",
		parseData: ps3DigitalButton(2, 0x08)
	},
	BUTTON_L2: {
		label: "Trigger Left",
		type: "Button",
		parseData: ps3Button(18, 3, 0x01)
	},
	BUTTON_R2: {
		label: "Trigger Right",
		type: "Button",
		parseData: ps3Button(19, 3, 0x02)
	},
	BUTTON_L1: {
		label: "Shoulder Left",
		type: "Button",
		parseData: ps3Button(20, 3, 0x04)
	},
	BUTTON_R1: {
		label: "Shoulder Right",
		type: "Button",
		parseData: ps3Button(21, 3, 0x08)
	},
	BUTTON_TRIANGLE: {
		label: "Triangle",
		type: "Button",
		parseData: ps3Button(22, 3, 0x10)
	},
	BUTTON_CIRCLE: {
		label: "Circle",
		type: "Button",
		parseData: ps3Button(23, 3, 0x20)
	},
	BUTTON_X: {
		label: "X",
		type: "Button",
		parseData: ps3Button(24, 3, 0x40)
	},
	BUTTON_SQUARE: {
		label: "Square",
		type: "Button",
		parseData: ps3Button(25, 3, 0x80)
	},
	BUTTON_PLAYSTATION: {
		label: "Playstation (PS)",
		type: "Button",
		parseData: ps3DigitalButton(4, 0x01)
	},
	INFO_CHARGE: {
		label: "Charge Level",
		type: "Info",
		parseData: buf => {
			let output = {digital:false,analog:0};

			output.digital = Boolean(buf[29]&0x01);
			output.analog = buf[29];

			return output;
		}
	},
	INFO_CONNECTION: {
		label: "Connection Type",
		type: "Info",
		parseData: buf => {
			let output = {digital:false,analog:0};

			output.digital = Boolean(buf[30]&0x01);
			output.analog = buf[30];

			return output;
		}
	},
};

const PS3 = {
	VENDOR_ID: 1356,
	PRODUCT_ID: 616,
	KEYS: KEYS,
	parseData: buf => {
		let parsed = {};

		if (buf) {
			const keys = Object.keys(KEYS);
			for (const i in keys) {
				const name = keys[i];
				const def = KEYS[name];

				let buttonData = def.parseData(buf);
				parsed[name] = {
					label: def.label,
					type: def.type,
					digital: buttonData.digital,
					analog: buttonData.analog
				};
			}
		}

		return parsed;
	}
};

module.exports = PS3;