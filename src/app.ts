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

            // Login as returning user
            await this.createEvent(userId, currentTime, "Auth", "Login", "Home", "LoginButton")
            currentTime += this.getRandomDelay(1, 2)

            // Go to My Bookings to find past booking
            await this.createEvent(userId, currentTime, "Booking", "GameBooking", "MyBookings", "BookNowButton")
            currentTime += this.getRandomDelay(2, 4)

            // Search for the venue they played at
            await this.createEvent(userId, currentTime, "Search", "VenueSearch", "SearchResults", "SearchBar")
            currentTime += this.getRandomDelay(1, 2)

            // Apply sport filter
            await this.createEvent(userId, currentTime, "Search", "VenueSearch", "SearchResults", "FilterBySport")
            currentTime += this.getRandomDelay(1, 2)

            // Click on venue details
            await this.createEvent(userId, currentTime, "Engagement", "VenueSearch", "VenueDetails", "BookNowButton")
            currentTime += this.getRandomDelay(2, 3)

            // Navigate to review section
            await this.createEvent(userId, currentTime, "Engagement", "Social", "ReviewScreen", "SubmitReviewBtn")
            currentTime += this.getRandomDelay(3, 5)

            // Submit the review
            await this.createEvent(userId, currentTime, "Engagement", "Social", "ReviewScreen", "SubmitReviewBtn")
            currentTime += this.getRandomDelay(1, 2)

            // 5% chance to update profile after review
            if (Math.random() < 0.05) {
                await this.createEvent(userId, currentTime, "ProfileUpdate", "Personalization", "Profile", "UpdateProfileBtn")
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


