'use client';

import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([])

    const addToCart = (produto) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === produto.id);

            if(existingItem) {
                return prevItems.map((item) => 
                    item.id === produto.id ? {...item, quantidade: item.quantidade + 1} : item
                );
            } else{
                return [...prevItems, {...produto, quantidade: 1}];
            }
        });
    };

    const removeFromCart = (id) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems((prevItems) =>
        prevItems.map((item) =>
            item.id === id ? {...item, quantidade: newQuantity} : item)
        );
    };

    const total = cartItems.reduce(
        (sum, item) => sum + item.preco * item.quantidade, 0
    );

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantidade, 0);

    return(
        <CartContext.Provider
         value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            total,
            itemCount,
         }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart(){
    const context = useContext(CartContext);
    if(!context){
        throw new Error('useCart deve ser usado dentro de um CartProvider')
    }
    return context;
}