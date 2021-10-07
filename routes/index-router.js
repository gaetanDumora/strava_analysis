import { getAccessToken } from '../authorization/auth.js'
import { fortune } from '../templates/helpers/fortune.js'
import { mongo } from '../data_base/Mongo.js'


export async function showAthletes(r, h) {
    const athlete = (await mongo.getUsersInfo()).map(el => el.athlete)
    return h.view('./index.html', {
        random_string: fortune(),
        users_info: athlete
    })
}

export async function getAuth(r, h) {
    const { code, scope } = r.query
    const userToken = await getAccessToken(code)
    await mongo.upsert('users_info', { "athlete.id": userToken.athlete.id }, userToken)
    return h.view('./code.html', { code, scope, athlete: userToken.athlete })
}

export async function userInfo(r, h) {
    const { user_id } = r.query
    const [{ athlete }] = await mongo.getUsersInfo({ "athlete.id": Number(user_id) })
    return h.view('./user.html', { info: athlete })
}