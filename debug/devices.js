const devices = require("../src/lib/devices");

// console.log(devices.VPEDAL.getInputs());

let connectedDevices = [];
const compatibleDevices = [
	devices.INFINITY_PEDAL,
	devices.VPEDAL
];

compatibleDevices.forEach(compatibleDevice => {
	if (connectedDevices.indexOf(compatibleDevice) < 0) {
		compatibleDevice.listen()
			.then(device => { connectedDevices.push(device); return device; }, logError)
			.then(logKeyPresses, () => {})
			.then(() => mapKeyPresses(compatibleDevice), () => {})
			.catch(logError);
	}
});


function logKeyPresses (device) {
	console.log(device.message);

	// device.emitter.on("up.BUTTON_REW", () => console.log("BUTTON_REW up"));
	// device.emitter.on("down.BUTTON_REW", () => console.log("BUTTON_REW down"));
	// device.emitter.on("up.BUTTON_FWD", () => console.log("BUTTON_FWD up"));
	// device.emitter.on("down.BUTTON_FWD", () => console.log("BUTTON_FWD down"));
	// device.emitter.on("up.BUTTON_PLAY", () => console.log("BUTTON_PLAY up"));
	// device.emitter.on("down.BUTTON_PLAY", () => console.log("BUTTON_PLAY down"));

	device.emitter.on("disconnect", disconnect => console.log(disconnect));

	return device;
}

function logError (err) {
	console.log(err);
}

function mapKeyPresses (device) {
	device.map("BUTTON_REW", "f3");
	device.map("BUTTON_PLAY", "f4");
	device.map("BUTTON_FWD", "f5");
}

/*setTimeout(() => {
	connectedDevices.forEach(device => device.stop());
}, 5000);*/