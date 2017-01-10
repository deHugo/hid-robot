function nimbusInput (label, type, number, byteIndex, defaultValue, valueRange, dataType) {
	return {
		label,
		type,
		number,
		byteIndex,
		defaultValue,
		valueRange,
		dataType
	};
}

function nimbusAnalogInput (label, type, number, byteIndex) {
	return nimbusInput(label, type, number, byteIndex, 0, [0, 255], 'uint8');
}

function nimbusAnalogStickAxis (label, type, number, byteIndex) {
	return nimbusInput(label, type, number, byteIndex, 0, [-127, 127], 'int8');
}

function nimbusAnalogStickAxisX (label, number, byteIndex) {
	return nimbusAnalogStickAxis(label, 'Stick X-Axis', number, byteIndex);
}
function nimbusAnalogStickAxisY (label, number, byteIndex) {
	return nimbusAnalogStickAxis(label, 'Stick Y-Axis', number, byteIndex);
}

function nimbusAnalogButton (label, number, byteIndex) {
	return nimbusAnalogInput(label, 'Button', number, byteIndex);
}

function nimbusAnalogDpad (label, number, byteIndex) {
	return nimbusAnalogInput(label, 'D-Pad', number, byteIndex);
}

const KEYS = {
	D_PAD_1_UP: nimbusAnalogDpad('D-Pad Up', 0, 0),
	D_PAD_1_RIGHT: nimbusAnalogDpad('D-Pad Right', 1, 1),
	D_PAD_1_DOWN: nimbusAnalogDpad('D-Pad Down', 2, 2),
	D_PAD_1_LEFT: nimbusAnalogDpad('D-Pad Left', 3, 3),
	BUTTON_1_A: nimbusAnalogButton('A', 0, 4),
	BUTTON_2_B: nimbusAnalogButton('B', 1, 5),
	BUTTON_3_X: nimbusAnalogButton('X', 2, 6),
	BUTTON_4_Y: nimbusAnalogButton('Y', 3, 7),
	BUTTON_5_L1: nimbusAnalogButton('L1', 4, 8),
	BUTTON_6_R1: nimbusAnalogButton('R1', 5, 9),
	BUTTON_7_L2: nimbusAnalogButton('L2', 6, 10),
	BUTTON_8_R2: nimbusAnalogButton('R2', 7, 11),
	BUTTON_9_MENU: nimbusInput ('Menu', 'Button', 8, 12, 0, [0,1], 'uint8'),
	STICK_1_AXIS_X: nimbusAnalogStickAxisX('Left Stick X-Axis', 0, 13),
	STICK_1_AXIS_Y: nimbusAnalogStickAxisY('Left Stick Y-Axis', 0, 14),
	STICK_2_AXIS_X: nimbusAnalogStickAxisX('Right Stick X-Axis', 1, 15),
	STICK_2_AXIS_Y: nimbusAnalogStickAxisY('Right Stick Y-Axis', 1, 16)
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