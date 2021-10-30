import { getAccessToken } from '../authorization/auth.js'
import { mongo } from '../data_base/Mongo.js'

export async function showAthletes(r, h) {
    const [{ total }] = await mongo.sum("users_activity", "distance")
    const athlete = (await mongo.getUsersInfo()).map(el => el.athlete).sort((a, b) => (a.firstname > b.firstname) ? 1 : ((b.firstname > a.firstname) ? -1 : 0))
    return h.view('./index.html', {
        kms: (total / 1000).toLocaleString('en').replace(',', ' '),
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
    return h.view('./code.html')
}

export async function userGraph(r, h) {
    const { user_id } = r.query
    const [{ athlete: { firstname } }] = await mongo.getUsersInfo({ "athlete.id": Number(user_id) })
    const activities = await mongo.getUsersActivity({
        "athlete.id": Number(user_id),
        // "start_date": { $gte: '2021-01-01' }
    })
    const values = activities.map(activity => {
        const { start_date, distance } = activity
        const date = new Date(start_date).toISOString().split('T')[0]
        return { date: date, distance: Number((distance / 1000).toPrecision(2)) }
    })
    return h.view('./graph.html', { name: firstname, activities: values })
}

export async function sendCSV(r, h){
    
}