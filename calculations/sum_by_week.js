import { mongo } from '../data_base/Mongo.js'
import { writeFile } from 'fs/promises'

export async function weekSynthesis(id) {
    try {
        const runs = await mongo.getCollection('users_activity')
        const by_week = runs.aggregate([
            { '$match': { 'athlete.id': id } },
            {
                '$group': {
                    '_id': {
                        'user': '$athlete.id',
                        'year': {
                            '$year': { '$toDate': '$start_date' }
                        },
                        // 'month': {
                        //     '$month': { '$toDate': "$start_date" }
                        // },
                        'week': {
                            '$week': { '$toDate': '$start_date' }
                        }
                    },
                    'dist_week': { '$sum': { '$divide': ['$distance', 1000] } },
                    'time_week': { '$sum': '$moving_time' },
                    'elevation_week': { '$sum': '$total_elevation_gain' },
                    'nb_run_week': { '$sum': 1 },
                    'calories_week': { '$sum': '$calories' }
                }
            },
            { '$sort': { '_id.year': 1, '_id.week': 1 } }
        ])
        return await by_week.toArray()
    } catch (error) {
        console.error(error)
    }
}

//id,sex,year,week,dist_week(km),time_week(s),elevation_week(m),nb_run_week,calories_week,
async function aggregateAndWrite() {
    for await (const user of await mongo.getUsersInfo()) {
        const { id, sex } = user.athlete
        const weekResults = await weekSynthesis(id)
        weekResults.map(async week => {
            const string = `${week._id.user},${sex},${week._id.year},${week._id.week},${week.dist_week},${week.time_week},${week.elevation_week},${week.nb_run_week},${week.calories_week}\n`
            await writeFile('../data/dist_by_week.csv', string, { flag: 'a' })
        })
    }
}
await aggregateAndWrite()
