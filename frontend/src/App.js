import React, { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./Components/Navbar/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Shop from "./Pages/Shop";
import Cart from "./Pages/Cart";
import Product from "./Pages/Product";
import Footer from "./Components/Footer/Footer";
import ShopCategory from "./Pages/ShopCategory";
import LoginSignup from "./Pages/LoginSignup";
import Wishlist from "./Components/Wishlist/Wishlist";

export const backend_url = 'https://ecommerce-backend-ldpj.onrender.com';
export const currency = 'LKR';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const authToken = localStorage.getItem('auth-token');
    const hasVisited = localStorage.getItem('hasVisited');
    
    if (authToken) {
      setIsLoggedIn(true);
    } else if (!hasVisited) {
      // First time visitor - show login modal
      setShowLoginModal(true);
      localStorage.setItem('hasVisited', 'true');
    }

    // Listen for storage changes (for logout detection across tabs)
    const handleStorageChange = () => {
      const token = localStorage.getItem('auth-token');
      setIsLoggedIn(!!token);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSuccess = (token) => {
    localStorage.setItem('auth-token', token);
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleSkipLogin = () => {
    setShowLoginModal(false);
  };

  return (
    <div className="App">
      <Router>
        {/* Main App Content */}
        <div className={showLoginModal ? 'app-blurred' : ''}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Shop gender="all" />} />
            <Route path="/womens" element={<ShopCategory category="women" />} />
            <Route path="/kids" element={<ShopCategory category="kid" />} />
            <Route path="/accessories" element={<ShopCategory category="accessories" />} />
            <Route path='/product' element={<Product />}>
              <Route path=':productId' element={<Product />} />
            </Route>
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/login" element={<LoginSignup />} />
          </Routes>
          <Footer />
        </div>

        {/* Login Modal Overlay */}
        {showLoginModal && (
          <div className="login-modal-overlay">
            <div className="login-modal">
              <button 
                className="modal-close-btn" 
                onClick={handleSkipLogin}
                aria-label="Close modal"
              >
                ×
              </button>
              <LoginSignup 
                isModal={true}
                onLoginSuccess={handleLoginSuccess}
                onSkip={handleSkipLogin}
              />
            </div>
          </div>
        )}
      </Router>
    </div>
  );
}

export default App;
