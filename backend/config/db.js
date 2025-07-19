import mongoose, { mongo } from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected' , () => { console.log("Database connected") })
        mongoose.connection.on('error', (err) => console.error("MongoDB connection error:", err))
        await mongoose.connect(`${process.env.MONGODB_URL}/Fashion_mern`, {
            serverSelectionTimeoutMS: 10000
        })
    } catch (error) {
        console.log(`Mongodb error :${error}`)
        process.exit(1)
    }
}

export default connectDB;