const devices = require("../src/lib/devices");

console.log(devices.VPEDAL.getInputs());

devices.INFINITY_PEDAL.listen()
    .then(device => {
        console.log(device.message)

        device.emitter.on("data", data => console.log(data))
        device.emitter.on("disconnect", disconnect => console.log(disconnect));
    }, err => console.error(err))

devices.VPEDAL.listen()
    .then(device => {
        console.log(device.message)

        device.emitter.on("data", data => console.log(data))
        device.emitter.on("disconnect", disconnect => console.log(disconnect));
    }, err => console.error(err))
    .catch(err => console.error(err));