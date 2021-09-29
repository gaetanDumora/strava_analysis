import axios from 'axios'
import { readFile } from 'fs/promises'
import { mongo } from '../data_base/Mongo.js'

const TOKEN_DIR = new URL('credentials', import.meta.url).pathname

const { client_id, client_secret, refresh_token, redirect_uri } = JSON.parse(await readFile(TOKEN_DIR + '/atchoum-app-secret.json'))

async function oauthRequest() {
    return new Promise(async (resolve, reject) => {
        try {
            const req = await axios({
                method: 'GET',
                url: 'https://www.strava.com/oauth/authorize',
                data: {
                    client_id,
                    client_secret,
                    redirect_uri,
                    response_type: 'code'
                }
            })
            resolve(req.data)
        } catch (error) {
            reject(error)
        }
    })
}

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
            return resolve(req.data)
        } catch (error) {
            return reject(error)
        }
    })
}

export async function getUserValidToken(userID) {
    try {
        const [{ expires_at, refresh_token, access_token }] = await mongo.getUsersInfo({ "athlete.id": userID })
        const now = new Date()
        const expireDate = new Date(expires_at * 1_000)
        if (expireDate <= now) {
            console.log('invalid token')
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