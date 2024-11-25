import { CART_KEY, useLocalState } from "@/hooks/useLocalStorage";
import { Card } from "@/lib/types";
import React, { createContext, useContext } from "react";

interface CartContextType {
  cart: Card[];
  addToCart: (card: Card) => void;
  removeFromCart: (cardId: string) => void;
  isInCart: (cardId: string) => boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useLocalState([], CART_KEY);

  const addToCart = (card: Card) => {
    setCart((prevCart: Card[]) => [...prevCart, card]);
  };

  const removeFromCart = (cardId: string) => {
    setCart((prevCart: Card[]) =>
      prevCart.filter((item) => item.id !== cardId),
    );
  };

  const isInCart = (cardId: string) => {
    return cart.some((item: Card) => item.id === cardId);
  };

  const clearCart = () => {
    localStorage.removeItem(CART_KEY);
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, isInCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
