import mongoose, { mongo } from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected' , () => { console.log("Database connected") })
        await mongoose.connect(`${process.env.MONGODB_URL}/Fashion_mern`)
    } catch (error) {
        console.log(`Mongodb error :${error}`)
    }
}

export default connectDB;