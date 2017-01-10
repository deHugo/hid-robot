const KEYS = {
	D_PAD_1_UP: {
		label: "D-Pad Up",
		type: "D-Pad",
		number: 0,
		byteIndex: 0,
		defaultValue: 0,
		valueRange: [0, 255],
		dataType: "uint8"
	},
	D_PAD_1_RIGHT: {
		label: "D-Pad Right",
		type: "D-Pad",
		number: 1,
		byteIndex: 1,
		defaultValue: 0,
		valueRange: [0, 255],
		dataType: "uint8"
	},
	D_PAD_1_DOWN: {
		label: "D-Pad Down",
		type: "D-Pad",
		number: 2,
		byteIndex: 2,
		defaultValue: 0,
		valueRange: [0, 255],
		dataType: "uint8"
	},
	D_PAD_1_LEFT: {
		label: "D-Pad Left",
		type: "D-Pad",
		number: 3,
		byteIndex: 3,
		defaultValue: 0,
		valueRange: [0, 255],
		dataType: "uint8"
	},
	BUTTON_1_A: {
		label: "A",
		type: "Button",
		number: 0,
		byteIndex: 4,
		defaultValue: 0,
		valueRange: [0, 255],
		dataType: "uint8"
	},
	BUTTON_2_B: {
		label: "B",
		type: "Button",
		number: 1,
		byteIndex: 5,
		defaultValue: 0,
		valueRange: [0, 255],
		dataType: "uint8"
	},
	BUTTON_3_X: {
		label: "X",
		type: "Button",
		number: 2,
		byteIndex: 6,
		defaultValue: 0,
		valueRange: [0, 255],
		dataType: "uint8"
	},
	BUTTON_4_Y: {
		label: "Y",
		type: "Button",
		number: 3,
		byteIndex: 7,
		defaultValue: 0,
		valueRange: [0, 255],
		dataType: "uint8"
	},
	BUTTON_5_L1: {
		label: "L1",
		type: "Button",
		number: 4,
		byteIndex: 8,
		defaultValue: 0,
		valueRange: [0, 255],
		dataType: "uint8"
	},
	BUTTON_6_R1: {
		label: "R1",
		type: "Button",
		number: 5,
		byteIndex: 9,
		defaultValue: 0,
		valueRange: [0, 255],
		dataType: "uint8"
	},
	BUTTON_7_L2: {
		label: "L2",
		type: "Button",
		number: 6,
		byteIndex: 10,
		defaultValue: 0,
		valueRange: [0, 255],
		dataType: "uint8"
	},
	BUTTON_8_R2: {
		label: "R2",
		type: "Button",
		number: 7,
		byteIndex: 11,
		defaultValue: 0,
		valueRange: [0, 255],
		dataType: "uint8"
	},
	BUTTON_9_MENU: {
		label: "Menu",
		type: "Button",
		number: 8,
		byteIndex: 12,
		defaultValue: 0,
		valueRange: [0, 1],
		dataType: "uint8"
	},
	STICK_1_AXIS_X: {
		label: "Left Stick X-Axis",
		type: "Stick X-Axis",
		number: 0,
		byteIndex: 13,
		defaultValue: 0,
		valueRange: [-127, 127],
		dataType: "int8"
	},
	STICK_1_AXIS_Y: {
		label: "Left Stick Y-Axis",
		type: "Stick Y-Axis",
		number: 0,
		byteIndex: 14,
		defaultValue: 0,
		valueRange: [-127, 127],
		dataType: "int8"
	},
	STICK_2_AXIS_X: {
		label: "Right Stick X-Axis",
		type: "Stick X-Axis",
		number: 1,
		byteIndex: 15,
		defaultValue: 0,
		valueRange: [-127, 127],
		dataType: "int8"
	},
	STICK_2_AXIS_Y: {
		label: "Right Stick Y-Axis",
		type: "Stick Y-Axis",
		number: 1,
		byteIndex: 16,
		defaultValue: 0,
		valueRange: [-127, 127],
		dataType: "int8"
	}
};

const NIMBUS = {
	// VENDOR_ID: 0xfd, // int 273
	VENDOR_ID: 273,
	VENDOR_NAME: "Steel Series",
	// PRODUCT_ID: 0x1420, // int 5152
	PRODUCT_ID: 5152,
	PRODUCT_NAME: "Nimbus",
	KEYS: KEYS,
	parseData: data => {
		let parsed = {};
		let rawValue;

		if (data) {
			const keys = Object.keys(KEYS);
			for (const i in keys) {
				const name = keys[i];
				const def = KEYS[name];

				switch (def.dataType) {
				case "int8":
					rawValue = data.readInt8(def.byteIndex);
					parsed[name] = {
						analog: rawValue,
						digital: Math.sign(rawValue),
						label: def.label,
						type: def.type
					};
					break;
				case "uint8":
					rawValue = data.readUInt8(def.byteIndex);
					parsed[name] = {
						analog: rawValue,
						digital: Boolean(rawValue),
						label: def.label,
						type: def.type
					};
					break;
				}
			}
		}

		return parsed;
	}
};

module.exports = NIMBUS;