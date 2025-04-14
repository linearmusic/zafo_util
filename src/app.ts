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

            // Initial sign up or login
            if (Math.random() < 0.3) {
                await this.createEvent(userId, currentTime, "Auth", "Login", "Home", "SignupCTA")
                currentTime += this.getRandomDelay(1, 2)
            }
            await this.createEvent(userId, currentTime, "Auth", "Login", "Home", "LoginButton")
            currentTime += this.getRandomDelay(1, 2)

            // Browse phase - Multiple search attempts
            const searchAttempts = Math.floor(Math.random() * 3) + 1
            for (let i = 0; i < searchAttempts; i++) {
                // Search for venues
                await this.createEvent(userId, currentTime, "Search", "VenueSearch", "Home", "SearchBar")
                currentTime += this.getRandomDelay(1, 3)

                // Apply sports filter
                await this.createEvent(userId, currentTime, "Search", "VenueSearch", "SearchResults", "FilterBySport")
                currentTime += this.getRandomDelay(2, 4)

                // View venue details
                await this.createEvent(userId, currentTime, "Engagement", "VenueSearch", "VenueDetails", "BookNowButton")
                currentTime += this.getRandomDelay(1, 3)

                // 30% chance to check reviews
                if (Math.random() < 0.3) {
                    await this.createEvent(userId, currentTime, "Engagement", "Social", "ReviewScreen", "SubmitReviewBtn")
                    currentTime += this.getRandomDelay(2, 4)
                }
            }

            // Booking attempt
            await this.createEvent(userId, currentTime, "Booking", "GameBooking", "BookingPage", "BookNowButton")
            currentTime += this.getRandomDelay(2, 3)

            // Payment initiation
            await this.createEvent(userId, currentTime, "Payment", "Transaction", "PaymentPage", "PayNowButton")
            currentTime += this.getRandomDelay(3, 5)

            // Payment abandonment (80% chance)
            if (Math.random() < 0.8) {
                // 40% chance to explicitly cancel, 60% chance to just abandon
                if (Math.random() < 0.4) {
                    // Explicit cancellation
                    await this.createEvent(userId, currentTime, "Cancellation", "CancellationFlow", "PaymentPage", "CancelBookingBtn")
                    currentTime += this.getRandomDelay(0.5, 1)
                } else {
                    // Passive abandonment - just leave the page
                    currentTime += this.getRandomDelay(10, 30) // Longer delay to simulate page abandonment
                }

                // 40% chance to return to browsing (regardless of cancellation type)
                if (Math.random() < 0.4) {
                    await this.createEvent(userId, currentTime, "Search", "VenueSearch", "Home", "SearchBar")
                }
            } else {
                // Complete payment
                await this.createEvent(userId, currentTime, "Payment", "Transaction", "PaymentPage", "PayNowButton")
                currentTime += this.getRandomDelay(1, 2)
                
                // View booking confirmation
                await this.createEvent(userId, currentTime, "Booking", "GameBooking", "MyBookings", "BookNowButton")
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


