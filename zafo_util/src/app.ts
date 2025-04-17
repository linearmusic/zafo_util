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
        console.log('Starting config loading...')
        this.configLoader = new ConfigLoader("src/config/prasoon.config.json")
        await this.configLoader.init()
        // Override the scenario from config with the one passed to constructor
        this.configLoader.data.scenario = this.scenario
        console.log('Config loading completed')
    }

    async setupDb() {
        console.log('Starting database setup...')
        this.dbManager = new DbManager(this.configLoader.data)
        await this.dbManager.init()
        console.log('Database setup completed')
    }

    async generator() {
        console.log('\n=== Starting Event Generation ===')
        const baseTime = Date.now()
        console.log(`Base time set to: ${new Date(baseTime).toISOString()}`)

        try {
            for (let userId = 1; userId <= 100; userId++) {
                console.log(`\n=== Processing User ${userId} ===`)
                let currentTime = baseTime

                // Login
                console.log(`Creating login event for user ${userId}`)
                await this.createEvent(userId, currentTime, "Auth", "Login", "Home", new MetaData("Home", "LoginButton"))
                currentTime += this.getRandomDelay(1, 2)
                console.log(`Login event created for user ${userId}`)

                // Browse and Search Phase
                const searchAttempts = Math.floor(Math.random() * 5) + 1
                console.log(`User ${userId} will make ${searchAttempts} search attempts`)
                
                for (let i = 0; i < searchAttempts; i++) {
                    console.log(`\nSearch attempt ${i + 1} for user ${userId}`)
                    // Initial search
                    await this.createEvent(userId, currentTime, "Search", "VenueSearch", "SearchResults", new MetaData("SearchResults", "FilterBySport"))
                    currentTime += this.getRandomDelay(1, 2)
                    console.log(`Search event created for user ${userId}`)

                    // View venue details
                    const venueViews = Math.floor(Math.random() * 3) + 1
                    console.log(`User ${userId} will view ${venueViews} venues`)
                    
                    for (let k = 0; k < venueViews; k++) {
                        console.log(`Creating venue view ${k + 1} for user ${userId}`)
                        await this.createEvent(userId, currentTime, "Engagement", "VenueSearch", "VenueDetails", new MetaData("VenueDetails", "BookNowButton"))
                        currentTime += this.getRandomDelay(1, 3)
                        console.log(`Venue view event created for user ${userId}`)
                    }
                }

                // Booking phase
                if (Math.random() < 0.7) {
                    console.log(`\nUser ${userId} proceeding to booking`)
                    await this.createEvent(userId, currentTime, "Booking", "GameBooking", "VenueDetails", new MetaData("VenueDetails", "BookNowButton"))
                    currentTime += this.getRandomDelay(1, 2)
                    console.log(`Booking event created for user ${userId}`)

                    // Payment phase
                    if (Math.random() < 0.6) {
                        console.log(`User ${userId} proceeding to payment`)
                        await this.createEvent(userId, currentTime, "Payment", "Transaction", "PaymentPage", new MetaData("PaymentPage", "PayNowButton"))
                        console.log(`Payment event created for user ${userId}`)
                    }
                }
                console.log(`=== Completed processing for user ${userId} ===\n`)
            }
            console.log('\n=== Event Generation Completed Successfully ===')
        } catch (error) {
            console.error('Error during event generation:', error)
            throw error
        }
    }

    private getRandomDelay(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min) * 1000
    }

    private async createEvent(userId: number, timestamp: number, tag: string, group: string, page: string, metaData: MetaData) {
        try {
            console.log(`Creating event for user ${userId} with tag ${tag}`)
            const event = new EventModel(
                userId,
                timestamp,
                tag,
                group,
                metaData
            )
            await this.dbManager.insert(event)
            console.log(`Event created successfully for user ${userId}`)
        } catch (error) {
            console.error(`Error creating event for user ${userId}:`, error)
            throw error
        }
    }
} 