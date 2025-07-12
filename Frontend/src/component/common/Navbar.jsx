import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';

function Navbar() {
    const isAuthenticated = ApiService.isAuthenticated();
    const isAdmin = ApiService.isAdmin();
    const isUser = ApiService.isUser();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        const isLogout = window.confirm('Are you sure you want to logout?');
        if (isLogout) {
            ApiService.logout();
            navigate('/home'); 
            setMenuOpen(false);
        }
    };

    const handleLinkClick = () => {
        setMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <NavLink to="/home" className="brand-link" onClick={handleLinkClick}>
                    Conference Room
                </NavLink>
            </div>

            <ul className={`navbar-ul ${menuOpen ? 'show' : ''}`}>
                <li><NavLink to="/home" className="nav-link" onClick={handleLinkClick}>Home</NavLink></li>
                <li><NavLink to="/rooms" className="nav-link" onClick={handleLinkClick}>Rooms</NavLink></li>

                <li><NavLink to="/BookingCalendar" className="nav-link" onClick={handleLinkClick}>Booking Calendar</NavLink></li>
                
                <li><NavLink to="/find-booking" className="nav-link" onClick={handleLinkClick}>Find my Booking</NavLink></li>
                {isUser && <li><NavLink to="/profile" className="nav-link" onClick={handleLinkClick}>Profile</NavLink></li>}
                {isAdmin && <li><NavLink to="/admin" className="nav-link" onClick={handleLinkClick}>Admin</NavLink></li>}
                {!isAuthenticated && <li><NavLink to="/login" className="nav-link" onClick={handleLinkClick}>Login</NavLink></li>}
                {!isAuthenticated && <li><NavLink to="/register" className="nav-link" onClick={handleLinkClick}>Register</NavLink></li>}
                {isAuthenticated && <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>}
            </ul>
        </nav>
    );
}

export default Navbar;
