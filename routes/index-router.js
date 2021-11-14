import { mongo } from '../data_base/Mongo.js'

export async function showAthletes(r, h) {
    const [{ total }] = await mongo.sum("users_activity", "distance")
    const athlete = (await mongo.getUsersInfo())
        .map(el => el.athlete)
        .sort((a, b) => (a.firstname > b.firstname)
            ? 1
            : ((b.firstname > a.firstname)
                ? -1
                : 0))
    return h.view('./index.html', {
        kms: (total / 1000).toLocaleString('en').replace(',', ' '),
        users_info: athlete
    })
}