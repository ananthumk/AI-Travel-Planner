const mongoose = require('mongoose')

const connectDb = async () => {
    try {
        // console.log('MONGO_URI is:', process.env.MONGO_URI);
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDb connected: ${conn.connection.host}`)
    } catch (error) {
        console.log(`MongoDb connection error: ${error.message}`)
        process.exit(1)
    }
}

module.exports = connectDb