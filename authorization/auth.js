import axios from 'axios'
import { readFile } from 'fs/promises'
import { mongo } from '../data_base/Mongo.js'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const DIR = dirname(fileURLToPath(import.meta.url))
const { client_id, client_secret } = JSON.parse(await readFile(DIR + '/credentials/atchoum-app-secret.json'))

// the code is returned in the url after the user has given his consent
export async function getAccessToken(code) {
    return new Promise(async (resolve, reject) => {
        try {
            const req = await axios({
                method: 'POST',
                url: 'https://www.strava.com/oauth/token',
                data: {
                    client_id,
                    client_secret,
                    code: code,
                    grant_type: 'authorization_code'
                }
            })
            //contains data in users_info collection
            return resolve(req.data)
        } catch (error) {
            return reject(error)
        }
    })
}

export async function getUserValidToken(userID) {
    try {
        const [{ expires_at, refresh_token, access_token }] = await mongo.getUsersInfo({ "athlete.id": userID })
        // Dates for validity testing
        const now = new Date()
        const expireDate = new Date(expires_at * 1_000)
        if (expireDate <= now) {
            console.log('token expire')
            // Asking for new token
            const req = await axios({
                method: 'POST',
                url: 'https://www.strava.com/oauth/token',
                data: {
                    client_id,
                    client_secret,
                    grant_type: 'refresh_token',
                    refresh_token: refresh_token
                }
            })
            await mongo.upsert('users_info', { "athlete.id": userID }, req.data)
            return req.data.access_token
        } else {
            console.log('valid token')
            return access_token
        }
    } catch (error) {
        console.error(error)
    }
}