import User from "../models/user.js";
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const registerUser = async (req,res) => {
    try {
        const { email, name, password } = req.body;

        if(!email || !name || !password){
            res.json({ success : false, message : 'Missing Details'})
        }

        //Check user already exist  or not
        const existsUser = await User.findOne({email})
        if(existsUser){
            return res.json({ success : false, message : "User already exist"})
        }

        // Validating email format & strong Password
        if(!validator.isEmail(email)){
            return res.json({ success : false, message :" Please enter a valid email "})
        }

        if(password.length < 8){
            return res.json({ success : false , message : "Please enter a strong password"})
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            name, 
            email, 
            password : hashedPassword
        })

        const user = await newUser.save()

        const token = jwt.sign({ id : user._id}, process.env.JWT_SECRET)

        res.json({ success :true, token})

    } catch (error) {
        console.log(error)
        res.json({ success : false, message : error.message})
    }
}

export const loginUser = async (req,res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({email});

        if(!user){
            return res.json({ success : false, message : "User doesn't exists"})
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(isMatch){
            const token = jwt.sign({id : user._id}, process.env.JWT_SECRET)
            res.json({ success : true, token})
        } else {
            res.json({ success : false, message : "Invaild credientials"})
        }
    } catch (error) {
        console.log(error)
        res.json({ success : false, message : error.message})
    }
}

export const adminLogin = async (req,res) => {
    try {
        const { email,password } = req.body;

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email + password , process.env.JWT_SECRET)
            res.json({ success : true, token})
        } else {
            res.json({ success : false, message : "Invaild credentials"})
        }
    } catch (error) {
        console.log(error)
        res.json({ success : false, message : error.message})
    }
}