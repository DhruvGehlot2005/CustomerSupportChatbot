/**
 * Products Page Component
 * 
 * Purpose: Display all products with filtering and search.
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCTS, CATEGORIES, getProductsByCategory, searchProducts } from '../data/products';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

export default function ProductsPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const filteredProducts = searchQuery
    ? searchProducts(searchQuery)
    : selectedCategory === 'All'
    ? PRODUCTS
    : getProductsByCategory(selectedCategory);

  return (
    <div className="products-page">
      <div className="products-container">
        <h1 className="page-title">Our Products</h1>

        {/* Search and Filter */}
        <div className="products-controls">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />

          <div className="category-filters">
            <button
              className={`filter-btn ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All')}
            >
              All
            </button>
            {CATEGORIES.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="no-products">
            <p>No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
