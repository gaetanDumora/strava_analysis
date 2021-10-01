import { MongoClient } from 'mongodb'
import { readFile } from 'fs/promises'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const DIR = dirname(fileURLToPath(import.meta.url))
const { mongo_user, mongo_password } = JSON.parse(await readFile(DIR + '/db-connexion.json'))

class MongoDatabase {
    constructor() {
        this.isConnect = false
        this.client = new MongoClient(`mongodb+srv://${mongo_user}:${mongo_password}@cluster0.xido9.mongodb.net/Cluster0?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
    }
    async connect() {
        try {
            await this.client.connect()
            this.db = this.client.db('mydb')
            this.isConnect = true
            return this
        } catch (error) {
            console.log(error)
            this.isConnect = false
        }
    }
    async list() {
        try {
            if (!this.isConnect) {
                await this.connect()
            }
            return console.log(await this.db.listCollections().toArray())
        } catch (error) {
            console.error(error)
        } finally {
            this.isConnect = false
            return await this.client.close()
        }
    }
    async addCollection(name, data) {
        try {
            if (!this.isConnect) {
                await this.connect()
            }
            const collection = this.db.collection(name)
            const { acknowledged, insertedId } = await collection.insertOne(data)
            console.log('insert ok: ', acknowledged.valueOf(), 'at: ', insertedId.getTimestamp())
        } catch (error) {
            console.error(error)
        } finally {
            this.isConnect = false
            return await this.client.close()

        }
    }
    async upsert(collectionName, filter, doc) {
        try {
            if (!filter) {
                throw new Error('no filter')
            }
            if (!this.isConnect) {
                await this.connect()
            }
            const collection = this.db.collection(collectionName)
            const { acknowledged, upsertedId } = await collection.updateOne(filter, { $set: doc }, {
                upsert: true
            })
            console.log('insert ok: ', acknowledged.valueOf(), 'at: ', upsertedId.getTimestamp())
        } catch (error) {
            console.error(error)
        } finally {
            this.isConnect = false
            return await this.client.close()
        }
    }
    async getUsersInfo(filter = {}) {
        try {
            if (!this.isConnect) {
                await this.connect()
            }
            const usersInfo = await this.db.collection('users_info')
                .find(filter)
                .toArray()
            return usersInfo
        } catch (error) {
            console.error(error)
        } finally {
            this.isConnect = false
            await this.client.close()
        }
    }
}

export const mongo = new MongoDatabase()