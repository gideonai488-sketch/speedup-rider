import React, { createContext, useContext, useState, useCallback } from 'react';
import { CartItem, LaundryService } from '@/types/laundry';

interface CartContextType {
  items: CartItem[];
  addItem: (service: LaundryService, quantity?: number, notes?: string) => void;
  removeItem: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((service: LaundryService, quantity = 1, notes?: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.service.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
            : item
        );
      }
      return [...prev, { service, quantity, notes }];
    });
  }, []);

  const removeItem = useCallback((serviceId: string) => {
    setItems((prev) => prev.filter((item) => item.service.id !== serviceId));
  }, []);

  const updateQuantity = useCallback((serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(serviceId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.service.id === serviceId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = items.reduce((sum, item) => {
    const basePrice = item.service.pricePerKg || 25;
    return sum + basePrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
