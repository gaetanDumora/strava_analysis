import { mongo } from '../data_base/Mongo.js'

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