import React from 'react'
import './Navbar.css'
import logo from '../Assets/logo.png'

const Navbar = () => {
  return (
    <div className='navbar'>
      <div className="nav-logo-container">
        <img src={logo} alt="Logo" className="nav-logo-img" />
        <div className="nav-text-container">
          <div className="nav-logo-text">SHOPPER</div>
          <div className="nav-admin-text">Admin Panel</div>
        </div>
      </div>
    </div>
  )
}

export default Navbar