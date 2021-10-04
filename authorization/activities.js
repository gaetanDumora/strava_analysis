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
            // get the current url, to change it later into next url, to fetch next page
            const next = new URL(options.url)
            console.log(`browse page N°: ${pageNb}`)
            pageNb += 1
            // setting now the next url 
            next.searchParams.set('page', pageNb)
            // passing the new url into the current axios object
            options.url = next.href
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
    const details = runingActivities.map(async act => {
        try {
            const req = await axios({
                method: 'GET',
                url: `https://www.strava.com/api/${VERSION}/activities/${act.id}?include_all_efforts=true`,
                headers: { Authorization: token }
            })
            // return only relevant from request and store it in the DB
            return console.log(req.data.activity)
        } catch (error) {
            console.error(error)
        }
    })
}

// Launching the process
export async function getUserActivities(userID) {
    // get the last token in the DB, if not valid, exchange refresh to access, and store these two new ones in DB
    const userAccessToken = await getUserValidToken(userID)
    // construct url for the first call
    const url = new URL(`/api/${VERSION}/athlete/activities`, `https://www.strava.com`)
    url.searchParams.set('after', '1577833200') //01/01/2020
    url.searchParams.set('per_page', '100')
    //  AXIOS parameters for request
    const options = {
        method: 'GET',
        url: url.href,
        headers: { Authorization: `Bearer ${userAccessToken}` }
    }
    // fetch page by page the global activity informations
    return browsePage(options, 1, printRuningActivities)
}

getUserActivities(18933919)