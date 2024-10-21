const BPivalue = [
    {
        i: 1,
        Ii: 0,
        CO: 0,
        SO2: 0,
        NO2: 0
    },
    {
        i: 2,
        Ii: 50,
        CO: 10000,
        SO2: 125,
        NO2: 100
    },
    {
        i: 3,
        Ii: 100,
        CO: 30000,
        SO2: 350,
        NO2: 200
    },
    {
        i: 4,
        Ii: 150,
        CO: 45000,
        SO2: 550,
        NO2: 700
    },
    {
        i: 5,
        Ii: 200,
        CO: 60000,
        SO2: 800,
        NO2: 1200
    },
    {
        i: 6,
        Ii: 300,
        CO: 90000,
        SO2: 1600,
        NO2: 2350
    },
    {
        i: 7,
        Ii: 400,
        CO: 120000,
        SO2: 2100,
        NO2: 3100
    },
    {
        i: 8,
        Ii: 500,
        CO: 150000,
        SO2: 2630,
        NO2: 3850
    }
]

function calAQI(type, data) {
    if (!data) return 0
    if (data > BPivalue[BPivalue.length - 1][type]) {
        return 500
    }
    else {
        for (let j = 0; j < BPivalue.length; j++) {
            if (BPivalue[j][type] < data && BPivalue[j + 1][type] > data) {
                return (data - BPivalue[j][type]) * (BPivalue[j + 1].Ii - BPivalue[j].Ii) / (BPivalue[j + 1][type] - BPivalue[j][type]) + BPivalue[j].Ii
            }
        }
    }
}

function getMaxAQI(data) {
    let coAQI = calAQI("CO", data.CO)
    let so2AQI = calAQI("SO2", data.SO2)
    let NO2AQI = calAQI("NO2", data.NO2)
    return { max: Math.max(coAQI, so2AQI, NO2AQI), type: Math.max(coAQI, so2AQI, NO2AQI) == coAQI ? "CO" : Math.max(coAQI, so2AQI, NO2AQI) == so2AQI ? "SO2" : "NO2" }
}

module.exports = {
    calAQI,
    getMaxAQI
}