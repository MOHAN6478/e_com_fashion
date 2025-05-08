import Order from "../models/order.js";
import User from "../models/user.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'

// global variables
const currency = 'inr'
const deliveryCharges = 10

//Placing orders using COD Method
export const placeOrder = async (req,res) => {
    try {
        const { userId } = req;
        const {  items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod:"COD",
            payment:false,
            date: Date.now()
        }

        const newOrder = new Order(orderData)
        await newOrder.save()

        await User.findByIdAndUpdate(userId, {cartData:{}})

        res.json({ success: true, message : "Order Placed"})
    } catch (error) {
        console.log(error)
        res.json({ success:false, message : error.message})
    }
}

// gateway initialize
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)


//Placing orders using COD Method
export const placeOrderStripe = async (req,res) => {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const { userId } = req;
        const {  items, amount, address } = req.body;
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod:"Stripe",
            payment:false,
            date: Date.now()
        }

        const newOrder = new Order(orderData)
        await newOrder.save()

        const line_items = items.map((item) => ({
            price_data : {
                currency : currency,
                product_data : {
                    name : item.name
                },
                unit_amount : item.price * 100
            },
            quantity : item.quantity
        }))

        line_items.push({
            price_data : {
                currency : currency,
                product_data : {
                    name : 'Delivery Charges'
                },
                unit_amount : deliveryCharges * 100
            },
            quantity : 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url : `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url : `${origin}/verify?success=false&orderId=${newOrder._id}`, 
            line_items,
            mode : 'payment' 
        })

        res.json({ success : true,session_url : session.url})

    } catch (error) {
        console.log(error)
        res.json({ success:false, message : error.message})
    }
}

// Verify Stripe
export const verifyStripe = async (req,res) => {
    const { userId } = req;
    const {orderId, success} = req.body;

    try {
        if(success === "true"){
            await Order.findByIdAndUpdate(orderId,{payment : true})
            await User.findByIdAndUpdate(userId, {cartData: {}})
            res.json({ success : true})
        } else {
            await Order.findByIdAndDelete(orderId)
            res.josn({success : false})
        }
    } catch (error) {
        console.log(error)
        res.json({ success:false, message : error.message})
    }
}


//Placing orders using COD Method
export const placeOrderRazorpay = async (req,res) => {
    try {
        const razorpayInstance = new razorpay({
            key_id : process.env.RAZORPAY_KEY_ID,
            key_secret : process.env.RAZORPAY_KEY_SECRET
        })
        const { userId } = req;
        const {  items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod:"Razorpay",
            payment:false,
            date: Date.now()
        }

        const newOrder = new Order(orderData)
        await newOrder.save()

        const options = {
            amount : amount * 100,
            currency : currency.toUpperCase(),
            receipt : newOrder._id.toString()
        }

        await razorpayInstance.orders.create(options,(error,order) => {
            if(error){
                console.log(error)
                return res.json({ success: false, message : error})
            }
            res.json({ success : true, order})
        })
    } catch (error) {
        console.log(error)
        res.json({ success : false, message : error.message })
    }
}

export const verifyRazorpay = async (req,res) => {
    try {

        const razorpayInstance = new razorpay({
            key_id : process.env.RAZORPAY_KEY_ID,
            key_secret : process.env.RAZORPAY_KEY_SECRET
        })
        
        const { userId } = req;
        const { razorpay_order_id } = req.body;  

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        if(orderInfo.status === 'paid'){
            await Order.findByIdAndUpdate(orderInfo.receipt,{payment : true})
            await User.findByIdAndUpdate(userId,{cartData : {}})
            res.json({success : true,message : "Payment Successfull"})
        } else {
            res.json({ success : false, message : "Payment Failed"})
        }
        
    } catch (error) {
        console.log(error)
        res.json({ success : false, message : error.message })
    }
}

// All orders data for Admin Panel
export const allOrders = async (req,res) => {
    try {
        const orders = await Order.find({})
        res.json({ success : true, orders})
    } catch (error) {
        console.log(error)
        res.json({ success : false,message : error.message})
    }
}

// User Order Data for Frontend
export const userOrders = async(req,res) => {
    try {
        const { userId } = req;
        const orders = await Order.find({userId})
        res.json({ success : true, orders})
    } catch (error) {
        console.log(error)
        res.json({ success : false, message: error.message})
    }
}

// Update Order Status from Admin Panel
export const updateStatus = async (req,res) => {
    try {
        const {orderId, status} = req.body;
        await Order.findByIdAndUpdate(orderId,{status})
        res.json({success : true,message : "Status Updated"})
    } catch (error) {
        console.log(error)
        res.json({ success : false, message: error.message})
    }
}