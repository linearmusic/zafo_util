import { ConfigModel } from "../config/config.model";
import { Database } from "sqlite3"
import { EventModel } from "../event.model";
import { dirname, join } from 'path';

const _queries = {
    drop: "drop table if exists event",
    create: "create table if not exists event (id integer primary key autoincrement, user_id integer, createdAt integer, tag text, mgroup text, meta_data text)",
}

export class DbManager {
    config: ConfigModel
    db: Database
    
    constructor(config: ConfigModel) {
        this.config = config
    }

    async init() {
        try {
            // Get path to config directory
            const configDir = dirname(this.config.file);
            const dbPath = join(configDir, 'prasoon.db');
            
            console.log('Creating database at:', dbPath);
            
            return new Promise<void>((resolve, reject) => {
                this.db = new Database(dbPath, (err) => {
                    if (err) {
                        console.error('Database creation error:', err);
                        reject(err);
                        return;
                    }
                    this.execute(_queries.drop)
                        .then(() => this.execute(_queries.create))
                        .then(resolve)
                        .catch(reject);
                });
            });
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    async insert(event: EventModel) {
        const q = 'insert into event (user_id, createdAt, tag, mgroup, meta_data) values (?,?,?,?,?)'
        const { userId, createdAt, tag, group, metaData } = event.dto()
        await this.execute(q, [userId, createdAt, tag, group, metaData])
    }

    async execute(sql: string, params?: (Date | number | string)[]): Promise<void> {
        if (params && params.length > 0) {
            return new Promise((resolve, reject) => {
                this.db.run(sql, params, (err) => {
                    if (err) {
                        console.error('SQL execution error:', err);
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        }
        return new Promise((resolve, reject) => {
            this.db.exec(sql, (err) => {
                if (err) {
                    console.error('SQL execution error:', err);
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    };
}