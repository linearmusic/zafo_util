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

            // Login
            await this.createEvent(userId, currentTime, "Auth", "Login", "Home", "LoginButton")
            currentTime += this.getRandomDelay(1, 2)

            // Random entry point: Direct booking (30%) or Search (70%)
            if (Math.random() < 0.7) {
                // Search and filter flow with randomization
                if (Math.random() < 0.8) {
                    await this.createEvent(userId, currentTime, "Search", "VenueSearch", "Home", "SearchBar")
                    currentTime += this.getRandomDelay(1, 3)
                }

                // Maybe apply filters (60% chance)
                if (Math.random() < 0.6) {
                    await this.createEvent(userId, currentTime, "Search", "VenueSearch", "SearchResults", "FilterBySport")
                    currentTime += this.getRandomDelay(1, 2)
                }

                // View 1-3 venues before booking
                const venuesToView = Math.floor(Math.random() * 3) + 1
                for (let i = 0; i < venuesToView; i++) {
                    await this.createEvent(userId, currentTime, "Engagement", "VenueSearch", "VenueDetails", "BookNowButton")
                    currentTime += this.getRandomDelay(2, 4)
                }
            }

            // Booking and payment
            await this.createEvent(userId, currentTime, "Booking", "GameBooking", "BookingPage", "BookNowButton")
            currentTime += this.getRandomDelay(2, 3)

            await this.createEvent(userId, currentTime, "Payment", "Transaction", "PaymentPage", "PayNowButton")
            currentTime += this.getRandomDelay(1, 2)

            // Random delay before cancellation (30min - 6 hours)
            currentTime += this.getRandomDelay(30, 360)

            // Direct cancellation
            await this.createEvent(userId, currentTime, "Cancellation", "CancellationFlow", "MyBookings", "CancelBookingBtn")
            currentTime += this.getRandomDelay(1, 2)

            // 20% chance to search for another venue after cancellation
            if (Math.random() < 0.2) {
                await this.createEvent(userId, currentTime, "Search", "VenueSearch", "Home", "SearchBar")
                currentTime += this.getRandomDelay(1, 3)
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


