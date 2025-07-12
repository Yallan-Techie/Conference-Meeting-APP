import React, { useState } from 'react';
import ApiService from '../../service/ApiService';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: ''
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value.trimStart() }); // remove leading spaces
    };

    const validateForm = () => {
        const { name, email, password, phoneNumber } = formData;

        // Name validation
        if (!name.trim()) {
            setErrorMessage('Name is required.');
            return false;
        }

      // Email validation: allow only Gmail addresses
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!email.trim() || !emailRegex.test(email)) {
        setErrorMessage('Please enter a valid Gmail address (e.g., yourname@gmail.com).');
        return false;
        }

        // Phone number validation
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneNumber.trim() || !phoneRegex.test(phoneNumber)) {
            setErrorMessage('Please enter a valid 10-digit phone number.');
            return false;
        }

        // Password validation: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!password.trim() || !passwordRegex.test(password)) {
            setErrorMessage(
                'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
            );
            return false;
        }

        setErrorMessage('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!validateForm()) {
            setTimeout(() => setErrorMessage(''), 5000);
            return;
        }

        try {
            const response = await ApiService.registerUser(formData);
            if (response.statusCode === 200) {
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phoneNumber: ''
                });
                setSuccessMessage('User registered successfully!');
                setTimeout(() => {
                    setSuccessMessage('');
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Registration failed.');
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    return (
        <div className="auth-container register-bg">
            <div className="register-card">
                <h2 className="register-title">Create Your Account</h2>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                <form onSubmit={handleSubmit} className="register-form" autoComplete="off">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            maxLength={10}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                        <small className="password-hint">
                            Must be 8+ characters with uppercase, lowercase, number & special char.
                        </small>
                    </div>
                    <button type="submit" className="register-btn">Register</button>
                </form>
                <p className="register-link">
                    Already have an account? <a href="/login">Login</a>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
