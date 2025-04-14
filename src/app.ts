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
            await this.createEvent(userId, currentTime, "Auth", "Login", "Home", new MetaData("Home", "LoginButton"))
            currentTime += this.getRandomDelay(1, 2)

            // Browse and Search Phase
            const searchAttempts = Math.floor(Math.random() * 5) + 1 // 1-5 search attempts
            for (let i = 0; i < searchAttempts; i++) {
                // Initial search
                await this.createEvent(userId, currentTime, "Search", "VenueSearch", "SearchResults", new MetaData("SearchResults", "FilterBySport"))
                currentTime += this.getRandomDelay(1, 2)

                // View venue details (possibly multiple times)
                const venueViews = Math.floor(Math.random() * 3) + 1 // 1-3 venue views
                for (let k = 0; k < venueViews; k++) {
                    await this.createEvent(userId, currentTime, "Engagement", "VenueSearch", "VenueDetails", new MetaData("VenueDetails", "BookNowButton"))
                    currentTime += this.getRandomDelay(1, 3)
                }
            }

            // 70% of users proceed to booking
            if (Math.random() < 0.7) {
                await this.createEvent(userId, currentTime, "Booking", "GameBooking", "VenueDetails", new MetaData("VenueDetails", "BookNowButton"))
                currentTime += this.getRandomDelay(1, 2)

                // 60% of those who book complete payment
                if (Math.random() < 0.6) {
                    await this.createEvent(userId, currentTime, "Payment", "Transaction", "PaymentPage", new MetaData("PaymentPage", "PayNowButton"))
                }
            }
        }
    }

    private getRandomDelay(minMinutes: number, maxMinutes: number): number {
        return Math.floor((Math.random() * (maxMinutes - minMinutes) + minMinutes) * 60 * 1000)
    }

    private async createEvent(userId: number, timestamp: number, tag: string, group: string, page: string, metaData: MetaData) {
        const event = new EventModel(
            userId,
            timestamp,
            tag,
            group,
            metaData
        )
        await this.dbManager.insert(event)
    }
}


