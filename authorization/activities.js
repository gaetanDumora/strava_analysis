import axios from 'axios'
import { mongo } from '../data_base/Mongo.js'
import { getUserValidToken } from './auth.js'

const VERSION = 'v3'

async function browsePage(options, page = 1) {
    try {
        const req = await axios(options)
        if (req.data.length === 0) {
            return console.log('all data browsed')
        } else {
            const next = new URL(options.url)
            page += 1
            next.searchParams.set('page', page)
            options.url = next.href
            browsePage(options, page)
        }
    } catch (error) {
        console.error(error)
    }
}

export async function getUserActivities(userID) {
    // get the last token in the DB, if not valid, exchange refresh to access, and store these two new ones in DB
    const userAccessToken = await getUserValidToken(userID)
    // construct url for the first call
    const url = new URL(`/api/${VERSION}/athlete/activities`, `https://www.strava.com`)
    url.searchParams.set('after', '1577833200') //01/01/2020
    url.searchParams.set('per_page', '100')
    //  AXIOS parameters
    const options = {
        method: 'GET',
        url: url.href,
        headers: { Authorization: `Bearer ${userAccessToken}` }
    }
    // fetch all data
    return browsePage(options)
}

getUserActivities(18933919)