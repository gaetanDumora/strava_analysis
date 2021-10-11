import { getAccessToken } from '../authorization/auth.js'
import { mongo } from '../data_base/Mongo.js'
import { getUserActivities } from '../insights/fetch-activities.js'

export async function showAthletes(r, h) {
    const [{total}] = await mongo.sum("users_activity", "distance")
    const athlete = (await mongo.getUsersInfo()).map(el => el.athlete)
    return h.view('./index.html', {
        kms : (total / 1000).toFixed(2),
        users_info: athlete
    })
}

//when the user accept, he's redirected to /confirm with the code in the url
export async function getAuth(r, h) {
    const { code } = r.query
    // this code is used to get the first access and refresh token
    const userToken = await getAccessToken(code)
    // Store the returned tokens 
    await mongo.upsert('users_info', { "athlete.id": userToken.athlete.id }, userToken)
    // Store his activities since 2019
    await getUserActivities(userToken.athlete.id)
    return h.view('./code.html')
}

export async function userInfo(r, h) {
    const { user_id } = r.query
    const [{ athlete }] = await mongo.getUsersInfo({ "athlete.id": Number(user_id) })
    return h.view('./user.html', { info: athlete })
}