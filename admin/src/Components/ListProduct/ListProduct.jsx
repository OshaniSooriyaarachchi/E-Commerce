import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png'
import { backend_url, currency } from "../../App";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);

  const fetchInfo = () => {
    fetch(`${backend_url}/allproducts`)
      .then((res) => res.json())
      .then((data) => {
        // Handle both old format (direct array) and new format (object with products array)
        if (Array.isArray(data)) {
          setAllProducts(data);
        } else if (data.products && Array.isArray(data.products)) {
          setAllProducts(data.products);
        } else {
          console.error("Unexpected data format:", data);
          setAllProducts([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setAllProducts([]);
      })
  }

  useEffect(() => {
    fetchInfo();
  }, [])

  const removeProduct = async (id) => {
    await fetch(`${backend_url}/removeproduct`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id }),
    })

    fetchInfo();
  }

  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p> <p>Title</p> <p>Old Price</p> <p>New Price</p> <p>Category</p> <p>Images</p> <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {Array.isArray(allproducts) && allproducts.length > 0 ? (
          allproducts.map((e, index) => (
            <div key={index}>
              <div className="listproduct-format-main listproduct-format">
                <img className="listproduct-product-icon" src={backend_url + e.image} alt="" />
                <p className="cartitems-product-title">{e.name}</p>
                <p>{currency}{e.old_price}</p>
                <p>{currency}{e.new_price}</p>
                <p>{e.category}</p>
                <p>{e.images ? e.images.length : 1} image(s)</p>
                <img className="listproduct-remove-icon" onClick={() => { removeProduct(e.id) }} src={cross_icon} alt="" />
              </div>
              <hr />
            </div>
          ))
        ) : (
          <div className="listproduct-format-main">
            <p>No products found or loading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListProduct;
