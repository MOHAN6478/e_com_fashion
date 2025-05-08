import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = ({children}) => {

    const navigate = useNavigate()

    const currency = '$';
    const delivery_fee = 10; 
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch ] = useState('');
    const [showSearch, setShowSearch ] = useState(false)

    const [ cartItems, setCartItems ] = useState({});
    const [ products, setProducts ] = useState([])

    const [token, setToken ] = useState('')
    
    const addToCart = async (itemId,size) => {

        if(!size){
            toast.error('Select product Size')
            return
        }

        let cartData = structuredClone(cartItems);

        if(cartData[itemId]){
            if(cartData[itemId][size]){
                cartData[itemId][size] += 1;
            } else{
                cartData[itemId][size] = 1
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData)

        if(token){
            try {
                await axios.post(backendUrl + '/api/cart/add',{itemId,size},{headers :{token} })
            } catch (error) {
                console.log(error);
                toast.error(error.message)
            }
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for(const itemId in cartItems){
            for(const size in cartItems[itemId]){
                try {
                    if(cartItems[itemId][size] > 0){
                        totalCount += cartItems[itemId][size]
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId,size,quantity) => {

        let cartData = structuredClone(cartItems);

        cartData[itemId][size] = quantity;

        setCartItems(cartData)

        if(token){
            try {
                await axios.post(backendUrl + '/api/cart/update',{itemId,size,quantity},{headers : {token}})
            } catch (error) {
                console.log(error);
                toast.error(error.message)
            }
        }
    }

    const getCartAmount =  () => {
        let totalAmount = 0;
        for (const itemId in cartItems){
            let itemInfo = products.find((product) => product._id === itemId);
            if (!itemInfo) continue;
            for(const size in cartItems[itemId]){
                const quantity = cartItems[itemId][size]
                try {
                    if(quantity > 0){
                        totalAmount += itemInfo.price * quantity
                    }
                } catch (error) {
                    toast.error(error.message)
                }
            }
        }
        return totalAmount;
    }

    const getProductsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/product/list')
            if(data.success){
                setProducts(data.products)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getUserCart = async (token) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/cart/get',{},{headers : {token}})
            if(data.success){
                setCartItems(data.cartData)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getProductsData()
    },[])

    useEffect(() => {
        if(!token && localStorage.getItem('token')){
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
        }
    },[])

    const value = {
        products, currency, delivery_fee, navigate,
        search, setSearch, showSearch, setShowSearch,
        cartItems ,addToCart, setCartItems,
        getCartCount, updateQuantity, getCartAmount,
        backendUrl, getProductsData,
        token, setToken
    }

    return(
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    )

} 

export default ShopContextProvider;
