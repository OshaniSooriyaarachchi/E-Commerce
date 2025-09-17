import React, { useContext } from 'react';
import './Wishlist.css';
import { ShopContext } from '../../Context/ShopContext';
import Item from '../Item/Item';

const Wishlist = () => {
  const { wishlist, products } = useContext(ShopContext);
  
  // Filter products to show only those in the wishlist
  const wishlistProducts = Array.isArray(products) && Array.isArray(wishlist) 
    ? products.filter(product => wishlist.includes(product.id))
    : [];

  return (
    <div className="wishlist">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <p>{wishlistProducts.length} items saved for later</p>
      </div>
      
      {wishlistProducts.length === 0 ? (
        <div className="wishlist-empty">
          <h3>Your wishlist is empty</h3>
          <p>Save items you love to buy them later</p>
        </div>
      ) : (
        <div className="wishlist-items">
          {wishlistProducts.map((item, i) => (
            <Item 
              id={item.id} 
              key={item.id} 
              name={item.name} 
              image={item.image} 
              new_price={item.new_price} 
              old_price={item.old_price}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
