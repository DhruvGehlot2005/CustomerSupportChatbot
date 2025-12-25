/**
 * Support Page
 * 
 * Purpose: Customer support page with AI-powered chatbot.
 * 
 * Features:
 * - AI chatbot interface
 * - Two conversation modes
 * - Real-time support
 * - Issue resolution
 * 
 * Integration:
 * - Uses Chat component
 * - Connects to backend API
 */

import SupportOptionChat from '../components/SupportOptionChat';
import './SupportPage.css';

export default function SupportPage(): JSX.Element {
  return (
    <div className="support-page">
      <div className="support-container">
        <div className="support-intro">
          <h1>💬 Customer Support</h1>
          <p>
            Our AI-powered support system is here to help you with orders, 
            delivery, refunds, and more. Get instant assistance 24/7.
          </p>
        </div>
        
        <SupportOptionChat />
      </div>
    </div>
  );
}
