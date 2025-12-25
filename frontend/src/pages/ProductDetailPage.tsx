/**
 * Product Detail Page
 */

import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../data/products';
import './ProductDetailPage.css';

export default function ProductDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const product = id ? getProductById(id) : undefined;

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="not-found">
            <h1>Product Not Found</h1>
            <Link to="/products" className="btn-back">← Back to Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to="/products" className="btn-back">← Back to Products</Link>

        <div className="product-detail">
          <div className="product-image-section">
            <img src={product.image} alt={product.name} className="detail-image" />
          </div>

          <div className="product-info-section">
            <h1 className="detail-title">{product.name}</h1>
            
            <div className="detail-rating">
              <span className="stars">{'⭐'.repeat(Math.floor(product.rating))}</span>
              <span className="rating-text">{product.rating} ({product.reviewCount} reviews)</span>
            </div>

            <div className="detail-price">
              <span className="current">₹{product.price.toFixed(0)}</span>
              {product.originalPrice && (
                <span className="original">₹{product.originalPrice.toFixed(0)}</span>
              )}
            </div>

            <div className="detail-stock">
              {product.inStock ? (
                <span className="in-stock">✓ In Stock</span>
              ) : (
                <span className="out-of-stock">✗ Out of Stock</span>
              )}
            </div>

            <p className="detail-description">{product.description}</p>

            <div className="detail-features">
              <h3>Features:</h3>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="detail-actions">
              <button className="btn-add-cart" disabled={!product.inStock}>
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <Link to="/support" className="btn-support">
                Need Help? Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
