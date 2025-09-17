import React, { useContext, useState, useEffect } from "react";
import "./ProductDisplay.css";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";

const ProductDisplay = ({product}) => {

  const {addToCart} = useContext(ShopContext);
  const [selectedImage, setSelectedImage] = useState(0);
  const [productImages, setProductImages] = useState([]);

  useEffect(() => {
    // Create array of product images
    if (product.images && product.images.length > 0) {
      // Use the images array from backend
      setProductImages(product.images);
    } else if (product.image) {
      // Fallback: if no images array, use single image
      setProductImages([product.image]);
    }
    setSelectedImage(0);
  }, [product]);

  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };

  // Check if there's a valid offer price
  const hasOfferPrice = product.new_price && product.new_price !== "" && product.new_price !== "0";

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          {productImages.map((image, index) => (
            <img 
              key={index}
              src={backend_url + image} 
              alt={`Product view ${index + 1}`}
              className={selectedImage === index ? 'selected-thumbnail' : ''}
              onClick={() => handleImageSelect(index)}
            />
          ))}
        </div>
        <div className="productdisplay-img">
          <img 
            className="productdisplay-main-img" 
            src={backend_url + (productImages[selectedImage] || product.image)} 
            alt="Main product view" 
          />
        </div>
      </div>
      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        <div className="productdisplay-right-prices">
          {hasOfferPrice ? (
            <>
              <div className="productdisplay-right-price-old">{currency}{product.old_price}</div>
              <div className="productdisplay-right-price-new">{currency}{product.new_price}</div>
            </>
          ) : (
            <div className="productdisplay-right-price-new">{currency}{product.old_price}</div>
          )}
        </div>
        <div className="productdisplay-right-description">
          <p>{product.description || "Black short dress with floral print"}</p>
        </div>
        <div className="productdisplay-right-size">
          <h1>Select Size</h1>
          <div className="productdisplay-right-sizes">
            <div>S</div>
            <div>M</div>
            <div>L</div>
            <div>XL</div>
            <div>XXL</div>
          </div>
        </div>
        <button onClick={()=>addToCart(product.id)}>ADD TO CART</button>
      </div>
    </div>
  );
};

export default ProductDisplay;
