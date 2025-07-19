import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import connectCloudinary from './config/cloudinary.js';
import dotenv from 'dotenv';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoutes.js';
import orderRouter from './routes/orderRoute.js';
dotenv.config();

// App config
const app = express()
const port = process.env.PORT || 4000;

const alllowedOrigin = ['http://localhost:5173','http://localhost:5174','https://ecom-fashion-eta.vercel.app', 'https://ecom-fashion-admin.vercel.app']

 connectDB()
 connectCloudinary() 

//Middleware
app.use(express.json())
app.use(cors({credentials : true, origin : alllowedOrigin}))


app.get('/',(req,res) => {
    res.send('API working')
})
app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)

app.listen(port, () => console.log(`Server is running http://localhost:${port}`))