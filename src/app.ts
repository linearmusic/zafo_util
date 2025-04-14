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

            // Initial login
            await this.createEvent(userId, currentTime, "Auth", "Login", "Home", "LoginButton")
            currentTime += this.getRandomDelay(1, 2)

            // Simulate 5 cricket venue bookings over a month
            for (let booking = 0; booking < 5; booking++) {
                // Search for venues
                await this.createEvent(userId, currentTime, "Search", "VenueSearch", "Home", "SearchBar")
                currentTime += this.getRandomDelay(1, 2)

                // Apply cricket filter
                await this.createEvent(userId, currentTime, "Search", "VenueSearch", "SearchResults", "FilterBySport")
                currentTime += this.getRandomDelay(1, 2)

                // View venue details
                await this.createEvent(userId, currentTime, "Engagement", "GameBooking", "VenueDetails", "ViewVenueDetails")
                currentTime += this.getRandomDelay(2, 4)

                // Initiate booking
                await this.createEvent(userId, currentTime, "Booking", "GameBooking", "VenueDetails", "BookNowButton")
                currentTime += this.getRandomDelay(1, 2)

                // Select time slot
                await this.createEvent(userId, currentTime, "Booking", "GameBooking", "BookingPage", "SelectTimeSlot")
                currentTime += this.getRandomDelay(1, 2)

                // Payment flow
                await this.createEvent(userId, currentTime, "Payment", "Transaction", "PaymentPage", "PayNowButton")
                currentTime += this.getRandomDelay(2, 3)

                // View booking confirmation
                await this.createEvent(userId, currentTime, "Booking", "GameBooking", "MyBookings", "ViewBookingDetails")
                currentTime += this.getRandomDelay(1, 2)

                // Add ~6 days between bookings (in milliseconds)
                currentTime += 6 * 24 * 60 * 60 * 1000 + this.getRandomDelay(1, 720) // Add 1 min to 12 hours random variation
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


