import { mongo } from '../data_base/Mongo.js'
import { getActivityStream } from '../logic/fetch-activities.js'

export async function userGraph(r, h) {
    const { user_id } = r.query
    const [{ athlete: { firstname } }] = await mongo.getUsersInfo({ "athlete.id": Number(user_id) })
    const activities = await mongo.getUsersActivity({
        "athlete.id": Number(user_id),
        // "start_date": { $gte: '2021-01-01' }
    })
    const values = activities.map(activity => {
        const { start_date, distance, id } = activity
        const date = new Date(start_date).toISOString().split('T')[0]
        return { id: id, date: date, distance: Number((distance / 1000).toPrecision(2)) }
    })
    return h.view('./graph.html', { name: firstname, activities: values })
}

export async function stream(r, h) {
    const userID = Number(r.query.user_id)
    const activityID = Number(r.query.activity_id.replace("/",""))
    const stream = await getActivityStream(userID, activityID)
    console.log(stream)
    return h.view('./stream.html', { user: userID, activity: stream })
}