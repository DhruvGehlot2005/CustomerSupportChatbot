/**
 * Product Card Component
 * 
 * Purpose: Display product information in a card format.
 * 
 * Features:
 * - Product image
 * - Name and price
 * - Rating and reviews
 * - Stock status
 * - Link to product detail page
 * 
 * Props:
 * - product: Product object to display
 */

import { Link } from 'react-router-dom';
import { Product } from '../data/products';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

/**
 * Product Card Component
 */
export default function ProductCard({ product }: ProductCardProps): JSX.Element {
  return (
    <Link to={`/product/${product.id}`} className="product-card">
      {/* Product Image */}
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        {product.originalPrice && (
          <span className="product-badge">Sale</span>
        )}
        {!product.inStock && (
          <span className="product-badge out-of-stock">Out of Stock</span>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        {/* Rating */}
        <div className="product-rating">
          <span className="rating-stars">
            {'⭐'.repeat(Math.floor(product.rating))}
          </span>
          <span className="rating-text">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="product-price">
          <span className="current-price">₹{product.price.toFixed(0)}</span>
          {product.originalPrice && (
            <span className="original-price">
              ₹{product.originalPrice.toFixed(0)}
            </span>
          )}
        </div>

        {/* Category */}
        <div className="product-category">{product.category}</div>
      </div>
    </Link>
  );
}
