import { ConfigLoader } from "./config/config.loader"
import { DbManager } from "./db/db.manager"
import { EventModel, MetaData } from "./event.model"

export class App {
    configLoader: ConfigLoader
    dbManager: DbManager

    async loadConfig() {
        this.configLoader = new ConfigLoader("src/config/prasoon.config.json")
        await this.configLoader.init()
    }

    async setupDb() {
        this.dbManager = new DbManager(this.configLoader.data)
        await this.dbManager.init()
    }

    async generator(userCount: number) {
        const baseTime = Date.now()

        for (let userId = 1; userId <= userCount; userId++) {
            let currentTime = baseTime

            // Login
            await this.createEvent(userId, currentTime, "Auth", "Login", "Home", "LoginButton")
            currentTime += this.getRandomDelay(1, 3)

            // Initial search from home
            await this.createEvent(userId, currentTime, "Search", "VenueSearch", "Home", "SearchBar")
            currentTime += this.getRandomDelay(1, 2)

            // Random number of search sessions (2-5 to show interest but no booking)
            const searchSessions = Math.floor(Math.random() * 4) + 2
            
            for(let session = 0; session < searchSessions; session++) {
                // Apply filters
                if (Math.random() < 0.8) {
                    await this.createEvent(userId, currentTime, "Search", "VenueSearch", "SearchResults", "FilterBySport")
                    currentTime += this.getRandomDelay(1, 2)
                }

                // View 2-4 venues per search session
                const venuesToView = Math.floor(Math.random() * 3) + 2
                for (let i = 0; i < venuesToView; i++) {
                    // View venue details
                    await this.createEvent(userId, currentTime, "Engagement", "VenueSearch", "VenueDetails", "BookNowButton")
                    currentTime += this.getRandomDelay(2, 4)

                    // 40% chance to go back to search results
                    if (Math.random() < 0.4) {
                        await this.createEvent(userId, currentTime, "Search", "VenueSearch", "SearchResults", "SearchBar")
                        currentTime += this.getRandomDelay(1, 2)
                    }
                }

                // Add longer delay between search sessions (3-10 minutes)
                currentTime += this.getRandomDelay(3, 10)
            }
        }
    }

    private getRandomDelay(minMinutes: number, maxMinutes: number): number {
        return Math.floor((Math.random() * (maxMinutes - minMinutes) + minMinutes) * 60 * 1000)
    }

    private async createEvent(userId: number, baseTime: number, tag: string, group: string, page: string, element: string) {
        const event = new EventModel(
            userId,
            baseTime + Math.floor(Math.random() * 30000), // Add random offset within 30 seconds
            tag,
            group,
            new MetaData(page, element)
        )
        await this.dbManager.insert(event)
    }
}


