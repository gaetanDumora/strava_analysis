import { getAccessToken } from '../logic/auth.js'
import { mongo } from '../data_base/Mongo.js'

//when the user accept, he's redirected to /confirm with the code in the url
export async function getAuth(r, h) {
    const { code } = r.query
    // this code is used to get the first access and refresh token
    const userToken = await getAccessToken(code)
    // Store the returned tokens 
    await mongo.upsert('users_info', { "athlete.id": userToken.athlete.id }, userToken)
        .then(getUserActivities(userToken.athlete.id ))
    return h.view('./code.html')
}