/**
 * Orders Page
 */

import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllOrders } from '../data/orders';
import OrderChat from '../components/OrderChat';
import './OrdersPage.css';

export default function OrdersPage(): JSX.Element {
  const { isAuthenticated, user } = useAuth();
  const orders = getAllOrders();
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="not-authenticated">
            <h1>Please Sign In</h1>
            <p>You need to be signed in to view your orders.</p>
            <Link to="/login" className="btn-login-link">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  // Find the order for active chat
  const activeChatOrder = orders.find(o => o.orderId === activeChatOrderId);

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="page-title">My Orders</h1>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>You haven't placed any orders yet.</p>
            <Link to="/products" className="btn-shop">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.orderId} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3 className="order-id">Order {order.orderId}</h3>
                    <p className="order-date">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div className={`order-status status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-name">{item.productName}</span>
                      <span className="item-quantity">Qty: {item.quantity}</span>
                      <span className="item-price">₹{item.price.toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span>Total:</span>
                    <span className="total-amount">₹{order.total.toFixed(0)}</span>
                  </div>
                  
                  {order.trackingNumber && (
                    <div className="order-tracking">
                      <span>Tracking: {order.trackingNumber}</span>
                    </div>
                  )}
                  
                  {order.estimatedDelivery && (
                    <div className="order-delivery">
                      <span>Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="order-actions">
                  <button 
                    className="btn-chat-support"
                    onClick={() => setActiveChatOrderId(order.orderId)}
                  >
                    💬 Chat Support
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat Modal */}
        {activeChatOrder && (
          <div className="chat-modal-overlay" onClick={() => setActiveChatOrderId(null)}>
            <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
              <OrderChat
                orderId={activeChatOrder.orderId}
                customerName={user?.name || 'Customer'}
                productName={activeChatOrder.items[0].productName}
                deliveryStatus={
                  activeChatOrder.status === 'Delivered' ? 'delivered' :
                  activeChatOrder.status === 'Shipped' ? 'in_transit' : 'processing'
                }
                deliveryDate={activeChatOrder.estimatedDelivery || activeChatOrder.orderDate}
                onClose={() => setActiveChatOrderId(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
