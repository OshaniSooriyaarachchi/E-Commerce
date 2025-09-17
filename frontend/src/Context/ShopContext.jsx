import React, { createContext, useEffect, useState } from "react";
import { backend_url } from "../App";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {

  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(false);

  const getDefaultCart = () => {
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }
    return cart;
  };

  const [cartItems, setCartItems] = useState(getDefaultCart());

  useEffect(() => {
    fetchProducts();
    if (localStorage.getItem("auth-token")) {
      getCartItems();
      getWishlistItems();
    }
  }, [])

  const fetchProducts = async (page = 1, sortBy = 'date', sortOrder = 'desc', append = false) => {
    setLoading(true);
    try {
      const response = await fetch(`${backend_url}/allproducts?page=${page}&limit=20&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      const data = await response.json();
      
      if (data && data.products) {
        if (append) {
          setProducts(prev => [...(prev || []), ...data.products]);
        } else {
          setProducts(data.products);
        }
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalProducts: data.products.length,
          hasNext: false,
          hasPrev: false
        });
      } else {
        // Fallback to old method for backward compatibility
        const fallbackResponse = await fetch(`${backend_url}/allproducts`);
        const fallbackData = await fallbackResponse.json();
        setProducts(Array.isArray(fallbackData) ? fallbackData : []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Set empty array as fallback
      setProducts([]);
    }
    setLoading(false);
  };

  const loadMoreProducts = () => {
    if (pagination.hasNext && !loading) {
      fetchProducts(pagination.currentPage + 1, 'date', 'desc', true);
    }
  };

  const sortProducts = (sortBy, sortOrder = 'desc') => {
    fetchProducts(1, sortBy, sortOrder, false);
  };

  const getCartItems = async () => {
    if (localStorage.getItem("auth-token")) {
      fetch(`${backend_url}/getcart`, {
        method: 'POST',
        headers: {
          Accept: 'application/form-data',
          'auth-token': `${localStorage.getItem("auth-token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(),
      })
        .then((resp) => resp.json())
        .then((data) => { setCartItems(data) });
    }
  };

  const getWishlistItems = async () => {
    if (localStorage.getItem("auth-token")) {
      try {
        const response = await fetch(`${backend_url}/getwishlist`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'auth-token': `${localStorage.getItem("auth-token")}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.wishlist)) {
          setWishlist(data.wishlist);
        } else {
          setWishlist([]);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlist([]);
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        try {
          let itemInfo = products?.find((product) => product.id === Number(item));
          if (itemInfo) {
            totalAmount += cartItems[item] * itemInfo.new_price;
          }
        } catch (error) {
          console.error('Error calculating cart amount:', error);
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        try {
          let itemInfo = products?.find((product) => product.id === Number(item));
          totalItem += itemInfo ? cartItems[item] : 0;
        } catch (error) {
          console.error('Error calculating cart items:', error);
        }
      }
    }
    return totalItem;
  };

  const addToCart = (itemId) => {
    if (!localStorage.getItem("auth-token")) {
      alert("Please Login");
      return;
    }
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    if (localStorage.getItem("auth-token")) {
      fetch(`${backend_url}/addtocart`, {
        method: 'POST',
        headers: {
          Accept: 'application/form-data',
          'auth-token': `${localStorage.getItem("auth-token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "itemId": itemId }),
      })
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (localStorage.getItem("auth-token")) {
      fetch(`${backend_url}/removefromcart`, {
        method: 'POST',
        headers: {
          Accept: 'application/form-data',
          'auth-token': `${localStorage.getItem("auth-token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "itemId": itemId }),
      })
    }
  };

  const addToWishlist = async (itemId) => {
    if (!localStorage.getItem("auth-token")) {
      alert("Please Login");
      return;
    }
    
    try {
      // Optimistically update UI first
      setWishlist(prev => [...prev, itemId]);
      
      const response = await fetch(`${backend_url}/addtowishlist`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem("auth-token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "itemId": itemId }),
      });
      const data = await response.json();
      
      if (!data.success) {
        // Revert on failure
        setWishlist(prev => prev.filter(id => id !== itemId));
        console.error('Failed to add to wishlist:', data.message);
      }
    } catch (error) {
      // Revert on error
      setWishlist(prev => prev.filter(id => id !== itemId));
      console.error('Error adding to wishlist:', error);
    }
  };

  const removeFromWishlist = async (itemId) => {
    if (!localStorage.getItem("auth-token")) {
      return;
    }
    
    try {
      // Optimistically update UI first
      setWishlist(prev => prev.filter(id => id !== itemId));
      
      const response = await fetch(`${backend_url}/removefromwishlist`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem("auth-token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "itemId": itemId }),
      });
      const data = await response.json();
      if (!data.success) {
        // Revert on failure
        setWishlist(prev => [...prev, itemId]);
        console.error('Failed to remove from wishlist:', data.message);
      }
    } catch (error) {
      // Revert on error
      setWishlist(prev => [...prev, itemId]);
      console.error('Error removing from wishlist:', error);
    }
  };

  const isInWishlist = (itemId) => {
    return Array.isArray(wishlist) ? wishlist.includes(itemId) : false;
  };

  const contextValue = { 
    products, 
    getTotalCartItems, 
    cartItems, 
    addToCart, 
    removeFromCart, 
    getTotalCartAmount,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    pagination,
    loading,
    loadMoreProducts,
    sortProducts,
    fetchProducts
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
