const devices = require("../src/lib/devices");

console.log(devices.VPEDAL.getInputs());

devices.INFINITY_PEDAL.listen()
	.then(device => {
		console.log(device.message);

		device.emitter.on("up.BUTTON_REW", data => console.log(data));
		device.emitter.on("down.BUTTON_REW", data => console.log(data));
		device.emitter.on("up.BUTTON_FWD", data => console.log(data));
		device.emitter.on("down.BUTTON_FWD", data => console.log(data));
		device.emitter.on("up.BUTTON_PLAY", data => console.log(data));
		device.emitter.on("down.BUTTON_PLAY", data => console.log(data));

		device.emitter.on("disconnect", disconnect => console.log(disconnect));
	}, err => console.error(err))
	.then(() => {
		devices.INFINITY_PEDAL.map("BUTTON_REW", "a");
		devices.INFINITY_PEDAL.map("BUTTON_PLAY", "s");
		devices.INFINITY_PEDAL.map("BUTTON_FWD", "d");
	});

devices.VPEDAL.listen()
	.then(device => {
		console.log(device.message);

		device.emitter.on("up.BUTTON_REW", data => console.log(data));
		device.emitter.on("down.BUTTON_REW", data => console.log(data));
		device.emitter.on("up.BUTTON_FWD", data => console.log(data));
		device.emitter.on("down.BUTTON_FWD", data => console.log(data));
		device.emitter.on("up.BUTTON_PLAY", data => console.log(data));
		device.emitter.on("down.BUTTON_PLAY", data => console.log(data));

		device.emitter.on("disconnect", disconnect => console.log(disconnect));

		return device;
	}, err => console.error(err))
	.then(() => {
		devices.VPEDAL.map("BUTTON_REW", "a");
		devices.VPEDAL.map("BUTTON_PLAY", "s");
		devices.VPEDAL.map("BUTTON_FWD", "d");
	})
	.catch(err => console.error(err));