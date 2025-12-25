/**
 * Root Application Component
 * 
 * Purpose: Main application component that sets up routing and global layout
 * 
 * Dependencies:
 * - react-router-dom: Client-side routing
 * - AuthContext: Authentication state management
 * 
 * Structure:
 * - BrowserRouter: Enables client-side routing
 * - AuthProvider: Provides authentication context
 * - Routes: Defines application routes
 * - Header: Navigation component
 * 
 * Integration Points:
 * - Routes to all pages (home, products, orders, auth, support)
 * - Provides global navigation and layout structure
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OrdersPage from './pages/OrdersPage';
import SupportPage from './pages/SupportPage';
import './App.css';

/**
 * App Component
 * 
 * Root component that provides routing structure for the entire application.
 * 
 * @returns {JSX.Element} The root application component
 */
function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Header />
          
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/support" element={<SupportPage />} />
            </Routes>
          </main>
          
          <footer className="app-footer">
            <p>&copy; 2025 ShopEase</p>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
