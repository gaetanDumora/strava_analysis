import axios from 'axios'
import { mongo } from '../data_base/Mongo.js'
import { getUserValidToken } from './auth.js'

const VERSION = 'v3'
const PATH = `https://www.strava.com/api/${VERSION}`

export async function getUser(userID) {
    try {
        const userAccessToken = await getUserValidToken(userID)
        const req = await axios({
            method: 'GET',
            url: PATH + '/athlete/activities',
            headers: { Authorization: `Bearer ${userAccessToken}` }
        })
        console.log(req.data)
    } catch (error) {
        console.error(error)
    }
}
getUser(18933919)