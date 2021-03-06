import axios from 'axios'
import { mongo } from '../data_base/Mongo.js'
import { getUserValidToken } from './auth.js'
import { writeFile } from 'fs/promises'

const VERSION = 'v3'

// Browse the pagination returned by the API and passing cb to data
async function browsePage(options, pageNb = 1, cb) {
    try {
        const req = await axios(options)
        if (req.data.length === 0) {
            // END
            return console.log('all data browsed')
        } else {
            // get the current url, in order to change it later, and fetch next page
            const next = new URL(options.url)
            console.log(`browse page N°: ${pageNb}`)
            pageNb += 1
            // setting now the next url (just changing the page number)
            next.searchParams.set('page', pageNb)
            // passing the new url into the current axios object
            options.url = next.href
            // passing callback to do some stuff with data 
            if (cb) {
                cb(req.data, options.headers.Authorization)
            }
            // CONTINUE
            return browsePage(options, pageNb, cb)
        }
    } catch (error) {
        console.error(error)
    }
}

function transpose(acc, curr, i) {
    if (i == 0) acc = curr.map(() => [])
    for (let j = 0; j < curr.length; j++) {
        acc[j][i] = curr[j]
    }
    return acc
}

function dateToUnixTemp(stringDate) {
    const now = new Date()
    const d = new Date(stringDate)
    const r = d > now ? now : d
    return Math.floor(r.getTime() / 1000)
}

async function getDetails(activities, token) {
    // Need to focus only on runing activities
    const runingActivities = activities.filter(activity => activity.type === 'Run')
    // And get more details about it, by requesting the API activities ID node 
    const collection = await Promise.all(runingActivities.map(async act => {
        try {
            const { data } = await axios({
                method: 'GET',
                url: `https://www.strava.com/api/${VERSION}/activities/${act.id}?include_all_efforts=true`,
                headers: { Authorization: token }
            })
            return data
        } catch (error) {
            console.error(error)
        }
    }))
    // Store activity if not exist (filter by athlete, activitty id, and date)
    return collection.map(async activity =>
        await mongo.upsert('users_activity', { "athlete.id": activity.athlete.id, id: activity.id, start_date_local: activity.start_date_local }, activity))
}

export async function getUserActivities(userID, sinceDate = "2019-01-01", untilDate = "2022-01-01") {
    // get the last token in the DB, if not valid, exchange refresh to access, and store these two new ones in DB
    const userAccessToken = await getUserValidToken(userID)
    const from = dateToUnixTemp(sinceDate)
    const to = dateToUnixTemp(untilDate)
    // construct url for the first call
    const url = new URL(`/api/${VERSION}/athlete/activities`, `https://www.strava.com`)
    url.searchParams.set('after', `${from}`)
    url.searchParams.set('before', `${to}`)
    url.searchParams.set('per_page', '100')
    const options = {
        method: 'GET',
        url: url.href,
        headers: { Authorization: `Bearer ${userAccessToken}` }
    }
    // retrieve global information on the activity page by page, and pass it to the callback
    await browsePage(options, 1, getDetails)
}

// , 35371314, 22008134, 3052459, 25075372, 6526563, 36000617 me:18933919
// const newUsers = [74771978]
// newUsers.forEach(async id => {
//     await getUserActivities(id)
// })

export async function updateAcitivities() {
    const now = new Date()
    const sevenDaysAgo = new Date(now.setDate(new Date().getDate() - 5))
        .toISOString()
        .split('T')[0]

    const getIds = (async () => {
        const users = await mongo.getUsersInfo()
        return users.map(user => user.athlete.id)
    })()
    const ids = await getIds
    return ids.forEach(id => getUserActivities(id, sevenDaysAgo))
}
// await updateAcitivities()

// Function for display stream graph on the users page 
export async function getActivityStream(userID, activityID) {
    const access = await getUserValidToken(userID)
    try {
        const { data } = await axios({
            method: 'GET',
            url: `https://www.strava.com/api/${VERSION}/activities/${activityID}/streams?keys=time,distance,altitude,velocity_smooth,heartrate,cadence,watts,temp,moving,grade_smooth&key_by_type=true`,
            headers: { Authorization: `Bearer ${access}` }
        })
        const deg = data.temp.data
        const seconds = data.time.data
        const meters = data.distance.data
        const ppm = data.cadence.data
        const bpm = data.heartrate.data || seconds.map(() => 0)
        const elevation = data.altitude.data || seconds.map(() => 0)
        const velocity = data.velocity_smooth.data
        const grade = data.grade_smooth.data
        return {
            sc: seconds,
            mt: meters,
            pm: ppm,
            bm: bpm,
            el: elevation,
            vy: velocity,
            gr: grade,
            dg: deg
        }
    } catch (error) {
        console.log(error)
        return {}
    }
}

// Function use to create .csv in data folder, scrap data and store in collection users_stream
async function getStream(token, activittyID, date) {
    try {
        const req = await axios({
            method: 'GET',
            url: `https://www.strava.com/api/${VERSION}/activities/${activittyID}/streams?keys=time,distance,altitude,velocity_smooth,heartrate,cadence,watts,temp,moving,grade_smooth&key_by_type=true`,
            headers: { Authorization: `Bearer ${token}` }
        })
        if (req.data && req.data.heartrate) {
            const deg = req.data.temp.data
            const seconds = req.data.time.data
            const meters = req.data.distance.data
            const ppm = req.data.cadence.data
            const bpm = req.data.heartrate.data || seconds.map(() => 0)
            const elevation = req.data.altitude.data || seconds.map(() => 0)
            const velocity = req.data.velocity_smooth.data
            const grade = req.data.grade_smooth.data
            const start_date = seconds.map(() => date)
            return [
                start_date,
                seconds,
                meters,
                ppm,
                bpm,
                elevation,
                velocity,
                grade,
                deg
            ]
            .reduce(transpose, [])
            .forEach(async line => {
                const s = line.toString() + '\n'
                await writeFile('../data/my_stream_2021.csv', s, { flag: "a" })
            })
        }
        // await mongo.upsert(
        //     'users_stream',
        //     {
        //         "user_id": userID,
        //         "activity_id": activittyID,
        //         "start_date": start_date
        //     },
        //     {
        //         "user_id": userID,
        //         "activity_id": activittyID,
        //         "start_date": start_date,
        //         "temp": deg,
        //         "time": seconds,
        //         "distance": meters,
        //         "cadence": ppm,
        //         "heartrate": bpm,
        //         "altitude": elevation,
        //         "pace": velocity,
        //         "adjusted_pace": grade
        //     }
        // )

    } catch (error) {
        console.error(error)
    }
}

// Get the Date and the Activity ID before calling getStream()
async function streamActivities(userID) {
    const acts = await mongo.getCollection("users_activity")
    const userToken = await getUserValidToken(userID)
    const userActIDs = await acts.find({ "athlete.id": userID, "start_date": { "$gte": "2020-12-12T00:00:00Z" } }).project({ "start_date": 1, "id": 1, "_id": 0 }).toArray()
    const ids = userActIDs.map(e => [e.start_date, e.id])
    return await Promise.all(ids.map(el => getStream(userToken, el[1], el[0])))
}

// await streamActivities(18933919)
// await mongo.closeConnexion()

// const summary = [
//     { sum: 11640, mean: 13.92, std2: 6.49, std: 2.55 },
//     { sum: 1138604, mean: 1361.97, std2: 616193.54, std: 784.98 },
//     { sum: 4568335.6, mean: 5464.52, std2: 10391603.29, std: 3223.6 },
//     { sum: 75093, mean: 89.82, std2: 48.82, std: 6.99 },
//     { sum: 131518, mean: 157.32, std2: 274.2, std: 16.56 },
//     { sum: 11950, mean: 14.29, std2: 226.83, std: 15.06 },
//     { sum: 3371.09, mean: 4.03, std2: 0.62, std: 0.79 },
//     { sum: 215, mean: 0.26, std2: 8.33, std: 2.89 }
// ]

// const stream = await streamActivities(18933919, 6269956413)
// const matrix = stream.reduce(transpose, [])
// console.log(matrix)
// await mongo.closeConnexion()

// const arr = [[1, 2, 3], [11, 22, 33], [111, 222, 333], [1111, 2222, 3333], [11111, 22222, 33333]]

// const mx = arr.reduce(transpose, [])

// console.log(mx)

// const s = [1, 2, 3].toString() + '\n'

// console.log(s)