import React, { useContext } from 'react'
import './Item.css'
import { Link } from 'react-router-dom'
import { ShopContext } from '../../Context/ShopContext'
import { backend_url } from '../../App'

const Item = (props) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(ShopContext);
  
  const handleWishlistClick = (e) => {
    e.preventDefault(); // Prevent navigation when clicking wishlist button
    e.stopPropagation();
    
    if (isInWishlist(props.id)) {
      removeFromWishlist(props.id);
    } else {
      addToWishlist(props.id);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it starts with /images, prepend backend URL
    if (imageUrl.startsWith('/images')) {
      return `${backend_url}${imageUrl}`;
    }
    
    // Otherwise, assume it's a local image
    return imageUrl;
  };

  return (
    <div className='item'>
      <Link to={`/product/${props.id}`}>
        <div className="item-image-container">
          <img 
            onClick={() => window.scrollTo(0, 0)} 
            src={getImageUrl(props.image)} 
            alt={props.name} 
          />
          <button 
            className={`wishlist-btn ${isInWishlist(props.id) ? 'in-wishlist' : ''}`}
            onClick={handleWishlistClick}
            title={isInWishlist(props.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            ♥
          </button>
        </div>
        <p>{props.name}</p>
        <div className="item-prices">
          <div className="item-price-new">
            ${props.new_price}
          </div>
          <div className="item-price-old">
            ${props.old_price}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default Item