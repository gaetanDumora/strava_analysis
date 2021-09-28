import axios from 'axios'
import { mongo } from '../data_base/Mongo.js'
import { isValidToken } from './auth.js'

const pathTo = {
    athlete: 'https://www.strava.com/api/v3/athlete',
    activies: 'https://www.strava.com/api/v3/athlete/activities',
    auth: 'https://www.strava.com/api/v3/oauth/token'
}

export async function getActivities(userID) {
    try {
        const [{access_token}] = await mongo.getUsersInfo({"athlete.id": userID})

        const req = await axios({
            method: 'GET',
            url: pathTo.athlete,
            headers: {Authorization: `Bearer ${access_token}`}
        })
        console.log(req.statusText)
    } catch (error) {
        console.error(error)
    }
}

getActivities(18933919)