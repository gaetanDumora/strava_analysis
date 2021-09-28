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

export async function isValidToken(accessToken){
    try {
        const [{expires_at, refresh_token, access_token}] = await mongo.getUsersInfo({"access_token": accessToken})
        const expireDate = new Date(expires_at * 1_000)
        return console.log(expires_at, expireDate)
    } catch (error) {
        console.error(error)
    }
}
await isValidToken('ee8b80911d8df5966b66ee69668b10d3d4e8133c')