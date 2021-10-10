import { mongo } from '../data_base/Mongo.js'

const [{total}] = await mongo.sum("users_activity", "distance")
console.log(total / 1000)
await mongo.closeConnexion()