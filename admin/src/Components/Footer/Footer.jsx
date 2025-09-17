import React from 'react'
import './Footer.css'
import logo from '../Assets/logo.png'

const Footer = () => {
  return (
    <div className='footer'>
      <div className='footer-content'>
        <div className='footer-logo-section'>
          <img src={logo} className='footer-logo' alt="Dress Cabinet Logo" />
          <span className='footer-company-name'>DRESS CABINET</span>
        </div>
        <div className='footer-copyright'>
          <p>Copyright @ 2024 - All Right Reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Footer
