
function button (digitalByteIndex, digitalByteMask) {
	return buf => {
		let output = {digital:false};

		output.digital = Boolean(buf[digitalByteIndex] & digitalByteMask);

		return output;
	};
}

const KEYS = {
	BUTTON_REW: {
		label: "Rewind",
		type: "Button",
		parseData: button(0, 0x01)
	},
	BUTTON_PLAY: {
		label: "Play/Pause",
		type: "Button",
		parseData: button(0, 0x02)
	},
	BUTTON_FWD: {
		label: "Fast Forward",
		type: "Button",
		parseData: button(0, 0x04)
	},
};

const VPEDAL = {
	VENDOR_ID: 0x05f3,
	PRODUCT_ID: 0x00ff,
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
					digital: buttonData.digital
				};
			}
		}

		return parsed;
	}
};

module.exports = VPEDAL;