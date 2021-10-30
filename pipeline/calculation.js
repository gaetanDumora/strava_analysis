import { mongo } from '../data_base/Mongo.js'
import { Transform } from 'stream'
import { createWriteStream, createReadStream } from 'fs'
import { writeFile } from 'fs/promises'

// for output file 
// const writer = createWriteStream('./ouput.csv', { encoding: 'utf8', flags: "a" })

// tranform stream readable from mongo, filter relevent fields, data type transformation (string utf8), writable to .csv
const fieldsFilter = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
        const not = "0"
        const {
            average_cadence,
            average_heartrate,
            average_speed,
            average_temp,
            calories,
            distance,
            max_heartrate,
            max_speed,
            moving_time,
            total_elevation_gain
        } = chunk

        const cadence = average_cadence ? String(average_cadence) : not
        const heartrate = average_heartrate ? String(average_heartrate) : not
        const speed = average_speed ? String(average_speed) : not
        const temp = average_temp ? String(average_temp) : not
        const cal = calories ? String(calories) : not
        const dist = distance ? String(distance) : not
        const maxHeart = max_heartrate ? String(max_heartrate) : not
        const maxSpeed = max_speed ? String(max_speed) : not
        const time = moving_time ? String(moving_time) : not
        const elevation = total_elevation_gain ? String(total_elevation_gain) : not
        // push into internal buffer
        this.push(cadence + " ", heartrate + " ", speed + " ", temp + " ", cal + " ", dist + " ", maxHeart + " ", maxSpeed + " ", time + " ", elevation, "\n")
        // passing cb to initiate the next chunk of data
        callback()
    }
})

// Init mongo connexion 
// const acts = await mongo.getCollection('users_activity')
// faster stream choice
// const readStream = acts.stream()
// or array methode slower, but work correctly
// const reader = await acts.toArray()
// reader.map(async doc => {
//     const [{ athlete }] = await mongo.getUsersInfo({ "athlete.id": doc.athlete.id })
//     const id = athlete.id ? athlete.id : 0
//     const weight = athlete.weight ? athlete.weight : 0
//     const sex = athlete.sex ? athlete.sex : "U"
//     let not = "0"
//     const {
//         start_date,
//         average_cadence,
//         average_heartrate,
//         average_speed,
//         average_temp,
//         calories,
//         distance,
//         max_heartrate,
//         max_speed,
//         moving_time,
//         total_elevation_gain
//     } = doc
//     const date = new Date(start_date).toISOString().split('T')[0]
//     const cadence = average_cadence ? String(average_cadence) : not
//     const heartrate = average_heartrate ? String(average_heartrate) : not
//     const speed = average_speed ? String(average_speed) : not
//     const temp = average_temp ? String(average_temp) : not
//     const cal = calories ? String(calories) : not
//     const dist = distance ? String(distance) : not
//     const maxHeart = max_heartrate ? String(max_heartrate) : not
//     const maxSpeed = max_speed ? String(max_speed) : not
//     const time = moving_time ? String(moving_time) : not
//     const elevation = total_elevation_gain ? String(total_elevation_gain) : not
//     let s = `${id};${weight};${sex};${date};${cadence};${heartrate};${speed};${temp};${cal};${dist};${maxHeart};${maxSpeed};${time};${elevation}\n`
//     // output 
//     return await writeFile('./data.csv', s, { flag: "a", encoding: "utf8" })
// })
// readStream
//     .pipe(fieldsFilter)
//     // .pipe(writer)
//     .pipe(process.stdout)

// reader.forEach(async (doc, index) => {
//     const { map: { polyline }, start_latitude, start_longitude } = doc
//     const path = polyline
//     const lat = String(start_latitude)
//     const lon = String(start_longitude)
//     let s = `${index};${lat};${lon};${path}\n`
//     await writeFile("./path.csv", s, { flag: "a" })
// })

function stats(arr) {
    const sum = arr.reduce((acc, curr) => acc + curr, 0)
    const n = arr.length
    const mean = sum / n
    const std = arr.reduce((acc, curr) => {
        return acc + Math.pow(curr - mean, 2)
    }, 0)
    return {
        sum,
        mean,
        std2: Number((std / n).toFixed(2)),
        std: Number(Math.sqrt(std / n).toFixed(2))
    }
}

const arr = [12, 15, 10, 13, 16, 12, 10, 13, 17, 8]

const activities = await mongo.getCollection("users_activity")
const readStream = createReadStream(await activities.toArray())

    .on("data", (chunk) => console.log(chunk))
    .on("end", () => {
        console.log("EOS")
        return mongo.closeConnexion()
    })
// console.log(stats(arr))