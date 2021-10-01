import axios from 'axios'
import { mongo } from '../data_base/Mongo.js'
import { getUserValidToken } from './auth.js'

const VERSION = 'v3'
const PATH = `https://www.strava.com/api/${VERSION}`

export async function getUserActId(userID) {
    try {
        const userAccessToken = await getUserValidToken(userID)
        const req = await axios({
            method: 'GET',
            url: PATH + '/athlete/activities?after=1577833200&page=1&per_page=1',
            headers: { Authorization: `Bearer ${userAccessToken}` }
        })
        console.log(req.data)
    } catch (error) {
        console.error(error)
    }
}
getUserActId(18933919)