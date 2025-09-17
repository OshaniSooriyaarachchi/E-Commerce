import React, { useState } from "react";
import "./AddProduct.css";
import upload_area from "../Assets/upload_area.svg";
import { backend_url } from "../../App";

const AddProduct = () => {

  const [images, setImages] = useState([]); // Changed to handle multiple images
  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    image: "",
    images: [], // Added images array
    category: "women",
    new_price: "",
    old_price: ""
  });

  const AddProduct = async () => {
    let dataObj;
    let product = productDetails;

    if (images.length === 0) {
      alert("Please select at least one image");
      return;
    }

    // Upload multiple images
    let formData = new FormData();
    images.forEach((image, index) => {
      formData.append('products', image);
    });

    await fetch(`${backend_url}/upload-multiple`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    }).then((resp) => resp.json())
      .then((data) => { dataObj = data });

    if (dataObj.success) {
      product.image = dataObj.main_image; // First image as main
      product.images = dataObj.image_urls; // All images
      
      await fetch(`${backend_url}/addproduct`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      })
        .then((resp) => resp.json())
        .then((data) => { 
          if (data.success) {
            alert("Product Added Successfully");
            // Reset form
            setImages([]);
            setProductDetails({
              name: "",
              description: "",
              image: "",
              images: [],
              category: "women",
              new_price: "",
              old_price: ""
            });
          } else {
            alert("Failed to add product");
          }
        });
    }
  }

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  }

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 10) {
      alert("You can upload maximum 10 images");
      return;
    }
    setImages(selectedFiles);
  }

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  }

  return (
    <div className="addproduct">
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input type="text" name="name" value={productDetails.name} onChange={(e) => { changeHandler(e) }} placeholder="Type here" />
      </div>
      <div className="addproduct-itemfield">
        <p>Product description</p>
        <input type="text" name="description" value={productDetails.description} onChange={(e) => { changeHandler(e) }} placeholder="Type here" />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input type="number" name="old_price" value={productDetails.old_price} onChange={(e) => { changeHandler(e) }} placeholder="Type here" />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input type="number" name="new_price" value={productDetails.new_price} onChange={(e) => { changeHandler(e) }} placeholder="Type here" />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product category</p>
        <select value={productDetails.category} name="category" className="add-product-selector" onChange={changeHandler}>
          <option value="women">Women</option>
          <option value="accessories">Accessories</option>
          <option value="kid">Kid</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Images (Select multiple images - Max 10)</p>
        <label htmlFor="file-input" className="addproduct-image-upload">
          <img className="addproduct-thumbnail-img" src={upload_area} alt="Upload Area" />
          <p>Click to upload images</p>
        </label>
        <input 
          onChange={handleImageChange} 
          type="file" 
          name="images" 
          id="file-input" 
          accept="image/*" 
          multiple 
          hidden 
        />
        
        {/* Display selected images */}
        {images.length > 0 && (
          <div className="addproduct-selected-images">
            <p>Selected Images ({images.length}/10):</p>
            <div className="addproduct-image-preview">
              {images.map((image, index) => (
                <div key={index} className="addproduct-image-item">
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt={`Preview ${index + 1}`}
                    className="addproduct-preview-img"
                  />
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    className="addproduct-remove-btn"
                  >
                    ×
                  </button>
                  {index === 0 && <span className="addproduct-main-label">Main</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <button className="addproduct-btn" onClick={() => { AddProduct() }}>ADD PRODUCT</button>
    </div>
  );
};

export default AddProduct;
