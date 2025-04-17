import { ConfigLoader } from "./config/config.loader"
import { DbManager } from "./db/db.manager"
import { EventModel, MetaData } from "./event.model"

export class App {
    configLoader: ConfigLoader
    dbManager: DbManager
    scenario: string

    constructor(scenario: string) {
        this.scenario = scenario
    }

    async loadConfig() {
        this.configLoader = new ConfigLoader("src/config/prasoon.config.json")
        await this.configLoader.init()
        this.configLoader.data.scenario = this.scenario
    }

    async setupDb() {
        this.dbManager = new DbManager(this.configLoader.data)
        await this.dbManager.init()
    }

    async generator() {
        const baseTime = Date.now()

        for (let userId = 1; userId <= 100; userId++) {
            let currentTime = baseTime

            // Initial signup
            await this.createEvent(userId, currentTime, "Auth", "Login", "Home", "SignupCTA")
            currentTime += this.getRandomDelay(1, 2)

            // Profile setup
            await this.createEvent(userId, currentTime, "ProfileUpdate", "Personalization", "Profile", "UpdateProfileBtn")
            currentTime += this.getRandomDelay(2, 4)

            // Start browsing
            await this.createEvent(userId, currentTime, "Search", "VenueSearch", "Home", "SearchBar")
            currentTime += this.getRandomDelay(1, 2)

            // Apply filters
            await this.createEvent(userId, currentTime, "Search", "VenueSearch", "SearchResults", "FilterBySport")
            currentTime += this.getRandomDelay(1, 3)

            // Browse venues (3-5)
            const venuesToView = Math.floor(Math.random() * 3) + 3
            for (let i = 0; i < venuesToView; i++) {
                await this.createEvent(userId, currentTime, "Engagement", "VenueSearch", "VenueDetails", "BookNowButton")
                currentTime += this.getRandomDelay(2, 4)

                // 40% chance to go back to search and filter
                if (Math.random() < 0.4) {
                    await this.createEvent(userId, currentTime, "Search", "VenueSearch", "SearchResults", "FilterBySport")
                    currentTime += this.getRandomDelay(1, 2)
                }
            }

            // 70% chance to proceed to booking
            if (Math.random() < 0.7) {
                await this.createEvent(userId, currentTime, "Booking", "GameBooking", "BookingPage", "BookNowButton")
                currentTime += this.getRandomDelay(2, 3)

                // 60% chance to complete payment
                if (Math.random() < 0.6) {
                    await this.createEvent(userId, currentTime, "Payment", "Transaction", "PaymentPage", "PayNowButton")
                    currentTime += this.getRandomDelay(1, 2)
                }
            }

            // Final profile updates (1-3 times)
            const profileUpdates = Math.floor(Math.random() * 3) + 1
            for (let i = 0; i < profileUpdates; i++) {
                await this.createEvent(userId, currentTime, "ProfileUpdate", "Personalization", "Profile", "UpdateProfileBtn")
                currentTime += this.getRandomDelay(2, 4)
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


