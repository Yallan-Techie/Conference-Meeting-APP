import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';

const EditBookingPage = () => {
  const navigate = useNavigate();
  const { bookingCode } = useParams();

  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingCode || bookingCode === 'undefined') {
      showError('Invalid booking code.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const bookingRes = await ApiService.getBookingByConfirmationCode(bookingCode);
        setBookingDetails(bookingRes.booking || bookingRes);
      } catch (err) {
        showError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingCode]);

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 2000);
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
      navigate('/admin/manage-bookings');
    }, 2000);
  };

  const deleteBooking = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this booking?')) return;

    try {
      const response = await ApiService.cancelBooking(bookingDetails.id);
      if (response.status === 200 || response.statusCode === 200) {
        showSuccess("Booking deleted successfully. User notified.");
      }
    } catch (err) {
      showError(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <p className="loading-message">Loading booking details...</p>;

  return (
    <div className="edit-booking-container">
      <h2 className="page-title">Booking Detail</h2>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {bookingDetails && (
        <div className="booking-card">
          <h3>Booking Info</h3>
          <p><strong>Confirmation Code:</strong> {bookingDetails.bookingConfirmationCode}</p>
          <p><strong>Check-in Date:</strong> {bookingDetails.checkInDate}</p>
          <p><strong>User Email:</strong> {bookingDetails.guestEmail || bookingDetails.user?.email}</p>
          <p><strong>Room Type:</strong> {bookingDetails.room?.roomType}</p>

          <div className="button-group">
            <button className="delete-btn" onClick={deleteBooking}>Delete Booking</button>
            <button className="back-btn" onClick={() => navigate(-1)}>Go Back</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditBookingPage;
