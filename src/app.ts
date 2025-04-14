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
        const timeStep = 2 * 60 * 1000 // 2 minutes base step

        for (let userId = 1; userId <= userCount; userId++) {
            let currentTime = baseTime

            // Login event
            await this.createEvent(userId, currentTime, "Auth", "Login", "Home", "LoginButton")
            currentTime += this.getRandomDelay(1, 3)

            // Random number of search sessions (1-4)
            const searchSessions = Math.floor(Math.random() * 4) + 1
            
            for(let session = 0; session < searchSessions; session++) {
                // Initial search with random sport filter
                await this.createEvent(userId, currentTime, "Search", "VenueSearch", "SearchResults", "FilterBySport")
                currentTime += this.getRandomDelay(0.5, 2)

                // Random refinements (0-4 times)
                const refinements = Math.floor(Math.random() * 5)
                for (let i = 0; i < refinements; i++) {
                    const searchAction = Math.random() < 0.5 ? "RefineSearch" : "SortResults"
                    await this.createEvent(userId, currentTime, "Search", "VenueSearch", "SearchResults", searchAction)
                    currentTime += this.getRandomDelay(0.3, 1)
                }

                // View random number of venues (1-4)
                const venuesToView = Math.floor(Math.random() * 4) + 1
                for (let i = 0; i < venuesToView; i++) {
                    // View venue details
                    await this.createEvent(userId, currentTime, "Engagement", "VenueSearch", "VenueDetails", "ViewVenue")
                    currentTime += this.getRandomDelay(0.5, 3)

                    // 30% chance to view venue photos
                    if (Math.random() < 0.3) {
                        await this.createEvent(userId, currentTime, "Engagement", "VenueSearch", "VenueDetails", "ViewPhotos")
                        currentTime += this.getRandomDelay(0.5, 2)
                    }

                    // 20% chance to view venue reviews
                    if (Math.random() < 0.2) {
                        await this.createEvent(userId, currentTime, "Engagement", "VenueSearch", "VenueDetails", "ViewReviews")
                        currentTime += this.getRandomDelay(1, 3)
                    }

                    // 40% chance to return to search
                    if (Math.random() < 0.4) {
                        await this.createEvent(userId, currentTime, "Search", "VenueSearch", "SearchResults", "BackToSearch")
                        currentTime += this.getRandomDelay(0.5, 1)
                    }
                }

                // 70% chance to start a new search session
                if (Math.random() >= 0.7) break

                // Add delay between search sessions
                currentTime += this.getRandomDelay(5, 15)
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


