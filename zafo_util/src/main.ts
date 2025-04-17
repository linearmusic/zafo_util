const script = async () => {
    // Get scenario from command line arguments or default to scenario1
    const scenario = process.argv[2] || 'scenario1'
    console.log(`\n=== Starting ${scenario} ===`)

    // Validate scenario format
    if (!/^scenario[1-7]$/.test(scenario)) {
        console.error(`❌ Invalid scenario: ${scenario}. Must be scenario1 through scenario7.`)
        process.exit(1)
    }

    try {
        console.log(`📦 Loading ${scenario} module...`)
        const appModule = await import(`./app.${scenario}`)
        
        if (!appModule.App) {
            console.error(`❌ No App class found in ${scenario} module`)
            process.exit(1)
        }
        
        console.log(`🔄 Creating ${scenario} instance...`)
        const app = new appModule.App(scenario)
        
        console.log(`⚙️ Loading configuration...`)
        await app.loadConfig()
        
        console.log(`💾 Setting up database...`)
        await app.setupDb()
        
        console.log(`🚀 Starting data generation...`)
        // Pass userCount parameter for scenario1 and scenario2
        if (scenario === 'scenario1' || scenario === 'scenario2') {
            await app.generator(100) // Generate data for 100 users
        } else {
            await app.generator()
        }
        
        console.log(`\n✅ ${scenario} completed successfully!`)
        console.log(`=== End of ${scenario} ===\n`)
    } catch (error) {
        console.error('\n❌ Error:', error)
        if (error.code === 'MODULE_NOT_FOUND') {
            console.error(`❌ Could not find app file for scenario: ${scenario}`)
        }
        process.exit(1)
    }
}

script().catch(error => {
    console.error('\n❌ Fatal Error:', error)
    process.exit(1)
})