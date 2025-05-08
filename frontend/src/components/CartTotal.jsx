import React, { useContext, useEffect, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import { toast } from 'react-toastify'

const CartTotal = () => {

  const {getCartAmount , delivery_fee, currency, cartItems, products } = useContext(ShopContext)

  const subtotal = useMemo(() => getCartAmount(), [cartItems, products]);

  useEffect(() => {
    try {
      getCartAmount();
    } catch (error) {
      console.error("Error calculating cart amount:", error);
      toast.error(error.message);
    }
  }, [cartItems, products]);

  return (
    <div className='w-full'>
      <div className='text-2xl'>
        <Title text1={'CART'} text2={'TOTALS'}/>
      </div>

      <div className='flex flex-col gap-2 mt-2 text-sm'>
        <div className='flex justify-between'>
          <p>Subtotal</p>
          <p>{currency} {subtotal}.00</p>
        </div>
        <hr />
        <div className='flex justify-between'>
          <p>Shipping Fee</p>
          <p>{currency} {delivery_fee}.00</p>
        </div>
        <hr />
        <div className='flex justify-between'>
            <b>Total</b>
            <b>{currency}{subtotal === 0 ? 0 : subtotal + delivery_fee}.00</b>
        </div>
      </div>
    </div>
  )
}

export default CartTotal