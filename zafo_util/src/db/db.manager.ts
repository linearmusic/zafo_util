import { ConfigModel } from "../config/config.model";
import { EventModel } from "../event.model";
import { MongoClient, Collection } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class DbManager {
    config: ConfigModel
    client: MongoClient
    collection: Collection

    constructor(config: ConfigModel) {
        this.config = config
    }

    async init() {
        try {
            console.log(`📊 Initializing database for ${this.config.scenario}...`)
            
            const mongoUri = process.env.MONGODB_URI;
            this.client = new MongoClient(mongoUri);
            await this.client.connect();
            
            const dbName = process.env.MONGODB_DB || 'zafotest';
            const db = this.client.db(dbName);
            this.collection = db.collection(this.config.scenario);
            
            // Clear existing data for this scenario
            await this.collection.deleteMany({});
            console.log(`✅ Database ready for ${this.config.scenario}`)
            
        } catch (error) {
            console.error('❌ Database initialization error:', error);
            throw error;
        }
    }

    async insert(event: EventModel) {
        try {
            const { userId, createdAt, tag, group, metaData } = event;
            const doc = {
                userId,
                createdAt: new Date(createdAt),
                tag,
                group,
                metaData: {
                    page: metaData.page,
                    element: metaData.element,
                    priority: metaData.priority || 0
                }
            };
            
            await this.collection.insertOne(doc);
        } catch (error) {
            console.error('❌ Insert error:', error);
            throw error;
        }
    }
}
