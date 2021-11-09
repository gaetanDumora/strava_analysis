import { mongo } from '../data_base/Mongo.js'
import { Transform } from 'stream'
import { writeFile } from 'fs/promises'

function formatNum(int) {
    return Number(int.toFixed(2))
}

function summary(arr) {
    const sum = formatNum(arr.reduce((acc, curr) => acc + curr, 0))
    const n = arr.length
    const mean = formatNum(sum / n)
    const std = (arr.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0)) / n
    return {
        sum,
        mean,
        std2: formatNum(std),
        std: formatNum(Math.sqrt(std))
    }
}

const filteredFields = {
    "athlete.id": true,
    "average_cadence": true,
    "average_heartrate": true,
    "average_speed": true,
    "average_temp": true,
    "calories": true,
    "distance": true,
    "elev_high": true,
    "elev_low": true,
    "max_heartrate": true,
    "max_speed": true,
    "moving_time": true,
    "splits_metric": true,
    "start_date": true,
    "total_elevation_gain": true
}

const calculation = new Transform({
    objectMode: true,
    transform(chunk, encoding, cb) {
        const { splits_metric } = chunk
        const avgSpeed = splits_metric
            ? splits_metric.map(x => x.average_speed)
            : []
        const avgHeartrate = splits_metric
            ? splits_metric.map(
                x => x.average_heartrate
                    ? x.average_heartrate
                    : 0)
            : []
        chunk.speed_summary = summary(avgSpeed)
        chunk.heartrate_summary = summary(avgHeartrate)
        this.push(chunk)
        cb()
    }
})
const userProfil = new Transform({
    objectMode: true,
    async transform(chunk, encoding, cb) {
        const [{ athlete }] = await mongo.getUsersInfo({ "athlete.id": chunk.athlete.id })
        chunk.id = athlete.id
        chunk.weight = athlete.weight ? athlete.weight : 0
        chunk.sex = athlete.sex ? athlete.sex : "U"
        this.push(chunk)
        cb()
    }
})
const toCsv = new Transform({
    objectMode: true,
    async transform(chunk, encoding, cb) {
        const {
            id,
            weight,
            sex,
            average_cadence,
            average_heartrate,
            average_speed,
            average_temp,
            calories,
            distance,
            elev_high,
            elev_low,
            max_heartrate,
            max_speed,
            moving_time,
            start_date,
            total_elevation_gain,
            speed_summary: { mean: speedAvg, std2: speedVar, std: speedStd },
            heartrate_summary: { mean: htAvg, std2: htVar, std: htStd }
        } = chunk
        const s = `${id},${sex},${weight},${start_date},${calories},${average_cadence},${average_temp},${distance},${elev_high},${elev_low},${max_heartrate},${max_speed},${moving_time},${total_elevation_gain},${speedAvg},${speedVar},${speedStd},${htAvg},${htVar},${htStd}\n`
        await writeFile('../data/all_activities.csv', s, { flag: "a" })
        cb()
    },
    async flush() {
        console.log("End of stream")
        return await mongo.closeConnexion()
    }
})

const users_activity = await mongo.getCollection("users_activity")
users_activity.find({},
    { projection: filteredFields })
    .stream()
    .pipe(calculation)
    .pipe(userProfil)
    .pipe(toCsv)

// mapReduce not in free account....
// const acts = await mongo.getCollection("users_activity")
// const mapFunction = () => {
//     const key = this._id
//     const values = { date: this.start_date, distance: this.distance, avg_speed: this.average_speed, metrics: this.splits_metric }
//     // emit(key, values)
// }
// const reduceFunction = (k, v) => {
//     console.log(k, v)
// }
// try {
//     acts.mapReduce(mapFunction, reduceFunction, {
//         query: { "athlete.id": 18933919, "start_date": { $gte: "2021-01-01" } },
//         out: { inline: 1 }
//     })
// } catch (error) {
//     console.error(error)
// }