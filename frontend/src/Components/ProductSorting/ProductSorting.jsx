import React, { useContext } from 'react';
import './ProductSorting.css';
import { ShopContext } from '../../Context/ShopContext';

const ProductSorting = () => {
  const { sortProducts } = useContext(ShopContext);

  const handleSortChange = (e) => {
    const value = e.target.value;
    const [sortBy, sortOrder] = value.split('-');
    sortProducts(sortBy, sortOrder);
  };

  return (
    <div className="product-sorting">
      <select onChange={handleSortChange} className="sort-select">
        <option value="date-desc">Newest First</option>
        <option value="date-asc">Oldest First</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="popularity-desc">Most Popular</option>
        <option value="rating-desc">Highest Rated</option>
      </select>
    </div>
  );
};

export default ProductSorting;
