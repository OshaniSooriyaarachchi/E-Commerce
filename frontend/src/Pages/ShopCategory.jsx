import React, { useContext, useEffect, useState } from "react";
import "./CSS/ShopCategory.css";
import dropdown_icon from '../Components/Assets/dropdown_icon.png'
import Item from "../Components/Item/Item";
import { Link } from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroll-component';
import { ShopContext } from "../Context/ShopContext";
import ProductSorting from "../Components/ProductSorting/ProductSorting";

const ShopCategory = (props) => {
  const { products, loadMoreProducts, pagination, loading } = useContext(ShopContext);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryProductCount, setCategoryProductCount] = useState(0);

  useEffect(() => {
    // Filter products by category
    if (Array.isArray(products)) {
      const categoryProducts = products.filter(item => item.category === props.category);
      setFilteredProducts(categoryProducts);
    } else {
      setFilteredProducts([]);
    }
  }, [products, props.category]);

  // Calculate total products for this category
  useEffect(() => {
    if (Array.isArray(products)) {
      const totalCategoryProducts = products.filter(item => item.category === props.category).length;
      setCategoryProductCount(totalCategoryProducts);
    }
  }, [products, props.category]);

  return (
    <div className="shopcategory">
      {props.banner && (
        <img className="shopcategory-banner" src={props.banner} alt="category banner" />
      )}
      
      <div className="shopcategory-indexSort">
        <p>
          <span>Showing {filteredProducts.length}</span> out of {categoryProductCount} Products
        </p>
        <ProductSorting />
      </div>

      <InfiniteScroll
        dataLength={filteredProducts.length}
        next={loadMoreProducts}
        hasMore={pagination.hasNext}
        loader={
          <div className="loading-spinner">
            <h4>Loading more products...</h4>
          </div>
        }
        endMessage={
          <div className="end-message">
            <p>You've seen all products in this category!</p>
          </div>
        }
      >
        <div className="shopcategory-products">
          {filteredProducts.map((item, i) => (
            <Item 
              id={item.id} 
              key={i} 
              name={item.name} 
              image={item.image}  
              new_price={item.new_price} 
              old_price={item.old_price}
            />
          ))}
        </div>
      </InfiniteScroll>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default ShopCategory;
