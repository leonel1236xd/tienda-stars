import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('stars_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('stars_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty, color, size) => {
    // 1. ANTES DE NADA, revisamos si el producto ya está en el carrito
    const existingItem = cart.find(
      (item) => item.id === product.id && item.color === color && item.size === size
    );

// 2. Averiguamos el stock máximo de esta variante (Soporta nulos y textos vacíos)
const currentVariant = product.variantes?.find(v => 
  String(v.color || '').trim() === String(color || '').trim() && 
  String(v.talla || '').trim() === String(size || '').trim()
);

// Forzamos el número real. Si no lo encuentra, da 0 (así jamás dejará añadir infinitos)
const maxStock = currentVariant ? (Number(currentVariant.stock_global) || 0) : 0;

    // 3. ¡EL BLOQUEO MAESTRO! Si ya tiene el máximo en el carrito, abortamos y devolvemos FALSE
    if (existingItem && existingItem.qty >= maxStock) {
      return false; 
    }

    // 4. Si hay stock disponible, lo añadimos al carrito normalmente
    setCart((prev) => {
      const newCart = [...prev];
      const existingIndex = newCart.findIndex(
        (item) => item.id === product.id && item.color === color && item.size === size
      );

      if (existingIndex > -1) {
        const item = { ...newCart[existingIndex] };
        let newQty = item.qty + qty;
        if (newQty > maxStock) newQty = maxStock;
        item.qty = newQty;
        newCart[existingIndex] = item;
        return newCart;
      }

      let initialQty = qty;
      if (initialQty > maxStock) initialQty = maxStock;

      return [
        ...newCart,
        {
          id: product.id,
          name: product.nombre,
          price: Number(product.precio),
          image: product.imagenes?.[0] || '',
          color,
          size,
          qty: initialQty,
          variantes: product.variantes
        }
      ];
    });
    
    setIsCartOpen(true);
    return true; // Devolvemos TRUE porque la operación fue un éxito
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // CORRECCIÓN BUG 1: Sumas de +2 y -2. Hacemos copia profunda ({ ... }) antes de editar
  const updateQuantity = (index, increment, maxStock) => {
    setCart((prev) => {
      const newCart = [...prev];
      const item = { ...newCart[index] }; // Copia profunda obligatoria
      
      let newQty = item.qty + increment;
      if (newQty < 1) newQty = 1;
      if (maxStock !== undefined && newQty > maxStock) newQty = maxStock; // Bloqueo de seguridad
      
      item.qty = newQty;
      newCart[index] = item;
      return newCart;
    });
  };

  // CORRECCIÓN BUG 2: Recalcular stock al cambiar variante desde el carrito
  const updateCartItem = (index, updates) => {
    setCart((prev) => {
      const newCart = [...prev];
      const itemToUpdate = { ...newCart[index], ...updates };

// Averiguamos el stock de la NUEVA variante que el usuario acaba de seleccionar
const currentVariant = itemToUpdate.variantes?.find(v => 
  String(v.color || '').trim() === String(itemToUpdate.color || '').trim() && 
  String(v.talla || '').trim() === String(itemToUpdate.size || '').trim()
);
const maxStock = currentVariant ? (Number(currentVariant.stock_global) || 0) : 0;

      // Si teníamos 5 y la nueva variante solo tiene 2, lo reducimos automáticamente a 2
      if (itemToUpdate.qty > maxStock) {
        itemToUpdate.qty = maxStock;
      }
      if (itemToUpdate.qty < 1) itemToUpdate.qty = 1;

      // Si al cambiar choca con otra prenda idéntica en el carrito, las fusionamos
      const duplicateIndex = newCart.findIndex((item, i) => 
        i !== index && 
        item.id === itemToUpdate.id && 
        item.color === itemToUpdate.color && 
        item.size === itemToUpdate.size
      );

      if (duplicateIndex > -1) {
        const dupItem = { ...newCart[duplicateIndex] };
        let combinedQty = dupItem.qty + itemToUpdate.qty;
        
        // Bloqueo final: aunque se fusionen, no pueden superar el stock
        if (combinedQty > maxStock) combinedQty = maxStock;
        
        dupItem.qty = combinedQty;
        newCart[duplicateIndex] = dupItem;
        newCart.splice(index, 1);
      } else {
        newCart[index] = itemToUpdate;
      }
      return newCart;
    });
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart, isCartOpen, setIsCartOpen, isCheckoutOpen, setIsCheckoutOpen,
        addToCart, removeFromCart, updateQuantity, updateCartItem, clearCart,
        cartTotal, cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);