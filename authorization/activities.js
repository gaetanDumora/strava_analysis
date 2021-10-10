import axios from 'axios'
import { mongo } from '../data_base/Mongo.js'
import { getUserValidToken } from './auth.js'

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

async function GetActivitiesDetails(activities, token) {
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
    // Store activity if not exist (id and date)
    return await collection.map(async activity => await mongo.upsert('users_activity', { "athlete.id": activity.athlete.id, id: activity.id, start_date_local: activity.start_date_local }, activity))
}

export async function getUserActivities(userID, sinceDate) {
    // get the last token in the DB, if not valid, exchange refresh to access, and store these two new ones in DB
    const userAccessToken = await getUserValidToken(userID)
    const unixTemp = Math.floor(new Date(sinceDate).getTime() / 1000)
    // construct url for the first call
    const url = new URL(`/api/${VERSION}/athlete/activities`, `https://www.strava.com`)
    url.searchParams.set('after', `${unixTemp}`)
    url.searchParams.set('per_page', '100')
    const options = {
        method: 'GET',
        url: url.href,
        headers: { Authorization: `Bearer ${userAccessToken}` }
    }
    // fetch page by page the global activity informations
    await browsePage(options, 1, GetActivitiesDetails)
}

// const ids = [318452, 33897681] 
// ids.map(async id => await getUserActivities(id, "2019-01-01"))
// await getUserActivities(8593716, "2019-01-01").then(async () => {
//     console.log("get activities ended")
//     // return await mongo.closeConnexion()
// })