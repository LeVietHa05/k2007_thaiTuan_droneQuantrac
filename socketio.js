const option = {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transport: ["websocket", "polling"],
        credential: true,
    }
}

const { log } = require("console");
// fs sync file envir data
const fs = require("fs");

let envirData = fs.readFileSync("envirData.json", "utf-8");
envirData = JSON.parse(envirData);
//watch file envir data
fs.watch("envirData.json", (event, filename) => {
    envirData = fs.readFileSync("envirData.json", "utf-8");
    envirData = JSON.parse(envirData);
});

const MAX_DATA_LENGTH = 20;
let isStart = false;
let location = {
    coord: {
        lat: 0,
        lon: 0,
    }
}

const tmpData = {
    TEMP: [],
    HUM: [],
    CO2: [],
    CO: [],
    Light: [],
    UV: [],
}

let tmpAvg = {
    TEMP: 0,
    HUM: 0,
    CO2: 0,
    CO: 0,
    Light: 0,
    UV: 0,
}

const io = require("socket.io")(option);

const socketapi = {
    io: io
}


io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("message", (data) => {
        console.log(`Received data from ESP32: ${data}`);
        //only calculate average when start signal is received
        if (isStart) {
            for (let key in data) {
                if (tmpData[key]) {
                    tmpData[key].push(data[key]);
                }
            }

            // calculate average
            if (tmpData.TEMP.length == MAX_DATA_LENGTH) {
                isStart = false;
                console.log("Calculating average data");
                for (let key in tmpData) {
                    tmpAvg[key] = tmpData[key].reduce((a, b) => a + b, 0) / tmpData[key].length;
                    tmpAvg[key] = Math.round(tmpAvg[key] * 100) / 100;
                    tmpData[key] = [];
                }
                let newData = {
                    id: envirData.length + 1,
                    date: new Date().toISOString().slice(0, 10),
                    time: new Date().toLocaleTimeString("en-US", { hourCycle: "h24" }),
                    data: {
                        TEMP: tmpAvg.TEMP,
                        HUM: tmpAvg.HUM,
                        CO2: tmpAvg.CO2,
                        CO: tmpAvg.CO,
                        Light: tmpAvg.Light,
                        UV: tmpAvg.UV,
                    },
                    location: {
                        latitude: location.coord.lat,
                        longitude: location.coord.lon,
                        height: 100
                    }
                }
                if (envirData) {
                    envirData.push(newData);
                    fs.writeFileSync("envirData.json", JSON.stringify(envirData));
                }
                socket.broadcast.emit("/web/newData", newData);
            }
        }
        socket.broadcast.emit("/web/measure", data)
    })

    socket.on("start", (data) => {
        console.log("start signal received");
        isStart = true;
        location.coord.lat = data.coord.lat;
        location.coord.lon = data.coord.lon;
        socket.broadcast.emit("/web/start", data);
    })

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
    socket.on("chat message", (msg) => {
        console.log("message: " + msg);
        io.emit("chat message", msg);
    });
});

module.exports = { socketapi };
