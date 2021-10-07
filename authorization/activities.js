import axios from 'axios'
import { mongo } from '../data_base/Mongo.js'
import { getUserValidToken } from './auth.js'

const VERSION = 'v3'

// Browse the pagination returned by the API
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
            // passing callback to to some stuff with data 
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

async function printRuningActivities(activities, token) {
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
    //console.log(collection)
    return await collection.map(async activity => await mongo.upsert('users_activity', {id: activity.id, start_date_local: activity.start_date_local} , activity))
}

// Start the process
export async function getUserActivities(userID) {
    // get the last token in the DB, if not valid, exchange refresh to access, and store these two new ones in DB
    const userAccessToken = await getUserValidToken(userID)
    // construct url for the first call
    const url = new URL(`/api/${VERSION}/athlete/activities`, `https://www.strava.com`)
    url.searchParams.set('after', '1609455600') //01/01/2020 1609455600(2021) 1577833200(2020)
    url.searchParams.set('per_page', '100')
    //  AXIOS parameters for request
    const options = {
        method: 'GET',
        url: url.href,
        headers: { Authorization: `Bearer ${userAccessToken}` }
    }
    // fetch page by page the global activity informations
    await browsePage(options, 1, printRuningActivities)
    //return await mongo.closeConnexion()
}
// My account id 18933919
getUserActivities(27149855)