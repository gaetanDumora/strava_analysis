import { mongo } from '../data_base/Mongo.js'
import { Transform } from 'stream'
import { createWriteStream } from 'fs'
import { writeFile } from 'fs/promises'

// for output file 
const writer = createWriteStream('./ouput.csv', { encoding: 'utf8', flags: "a" })

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
const acts = await mongo.getCollection('users_activity')
// faster stream choice
const readStream = acts.stream()
// or array methode slower, but work correctly
const reader = await acts.toArray()
const out = reader.map(async doc => {
    let not = "0"
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
    } = doc
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
    let s = `${cadence};${heartrate};${speed};${temp};${cal};${dist};${maxHeart};${maxSpeed};${time};${elevation}\n`
    // output 
    return await writeFile('./out.csv', s, { flag: "a", encoding:"utf8" })

})
// readStream
//     .pipe(fieldsFilter)
//     // .pipe(writer)
//     .pipe(process.stdout)
