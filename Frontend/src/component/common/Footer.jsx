import React from 'react';
import { Link } from 'react-router-dom';


const FooterComponent = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-title">Conference Room Booking System</div>
        <p className="footer-tagline">
          Simplify your meetings – Book conference rooms instantly and efficiently.
        </p>
        <div className="footer-features">
          <ul>
            <li>✔ Real-time room availability</li>
            <li>✔ Secure login for employees & admins</li>
            <li>✔ Detailed booking history</li>
            <li>✔ Email confirmation and reminders</li>
          </ul>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Conference Room Booking | All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;
