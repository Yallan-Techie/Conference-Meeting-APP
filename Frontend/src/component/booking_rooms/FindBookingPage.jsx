import React, { useState } from "react";
import ApiService from "../../service/ApiService";

function FindBookingPage() {
  const [bookingCode, setBookingCode] = useState("");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookingCode.trim()) {
      setError("Please enter your booking confirmation code.");
      return;
    }

    setLoading(true);
    setError("");
    setBooking(null);

    try {
      const response = await ApiService.getBookingByConfirmationCode(bookingCode.trim());
      if (response && (response.booking || response.id)) {
        setBooking(response.booking || response);
      } else {
        setError("No booking found for this confirmation code.");
      }
    } catch (err) {
      setError("No booking found for this confirmation code.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const min = m;
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12.toString().padStart(2, '0')}:${min} ${ampm}`;
  };

  return (
    <div className="find-booking-bg">
      <div className="find-booking-page">
        <h2 className="find-booking-title">Find Your Booking</h2>
        <p className="find-booking-desc">
          Enter your <span className="highlight">Confirmation Code</span> to view your reservation.
        </p>
        <form className="search-container" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Confirmation Code"
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value)}
            className="booking-input"
          />
          <button type="submit" className="find-btn">
            {loading ? "Searching..." : "Find Booking"}
          </button>
        </form>

        {error && <div className="booking-error">{error}</div>}

        {booking && (
          <div className="booking-details">
            <h3>Booking Details</h3>
            <div className="booking-info-row">
              <span className="booking-label">Booking ID:</span>
              <span className="booking-value">{booking.id}</span>
            </div>
            <div className="booking-info-row">
              <span className="booking-label">Name:</span>
              <span className="booking-value">{booking.user?.name || "Guest"}</span>
            </div>
            <div className="booking-info-row">
              <span className="booking-label">Email:</span>
              <span className="booking-value">{booking.guestEmail || booking.user?.email}</span>
            </div>
            <div className="booking-info-row">
              <span className="booking-label">Room:</span>
              <span className="booking-value">{booking.room?.roomType}</span>
            </div>
            <div className="booking-info-row">
              <span className="booking-label">Date:</span>
              <span className="booking-value">{booking.checkInDate}</span>
            </div>
            <div className="booking-info-row">
              <span className="booking-label">Time Slots:</span>
              <span className="booking-value">
                <ul>
                  {booking.timeSlots?.length > 0 ? (
                    booking.timeSlots.map((slot, i) => (
                      <li key={i}>{slot.label || `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}</li>
                    ))
                  ) : (
                    <li>No time slots found</li>
                  )}
                </ul>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FindBookingPage;
