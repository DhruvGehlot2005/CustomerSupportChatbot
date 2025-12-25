/**
 * Home Page Component
 * 
 * Purpose: Landing page for the e-commerce site.
 * 
 * Features:
 * - Hero section with call-to-action
 * - Featured products
 * - Category highlights
 * - Link to support chat
 * 
 * Integration:
 * - Displays products from product data
 * - Links to product pages and support
 */

import { Link } from 'react-router-dom';
import { getFeaturedProducts, CATEGORIES } from '../data/products';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

/**
 * Home Page Component
 */
export default function HomePage(): JSX.Element {
  const featuredProducts = getFeaturedProducts();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to ShopEase</h1>
          <p className="hero-subtitle">
            Your one-stop shop for quality products with AI-powered customer support
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn-primary">
              Shop Now
            </Link>
            <Link to="/support" className="btn-secondary">
              Need Help? Chat with Us
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <h2 className="section-title">Featured Products</h2>
        <p className="section-subtitle">Check out our most popular items</p>
        
        <div className="products-grid">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="section-cta">
          <Link to="/products" className="btn-view-all">
            View All Products →
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <h2 className="section-title">Shop by Category</h2>
        
        <div className="categories-grid">
          {CATEGORIES.map(category => (
            <Link
              key={category}
              to={`/products?category=${encodeURIComponent(category)}`}
              className="category-card"
            >
              <span className="category-icon">📦</span>
              <span className="category-name">{category}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Support CTA */}
      <section className="support-cta-section">
        <div className="support-cta-content">
          <h2>Need Assistance?</h2>
          <p>
            Our AI-powered support system is here to help you 24/7.
            Get instant answers to your questions about orders, delivery, refunds, and more.
          </p>
          <Link to="/support" className="btn-support-cta">
            Start Chat Support
          </Link>
        </div>
      </section>
    </div>
  );
}
