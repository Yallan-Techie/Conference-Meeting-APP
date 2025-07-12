import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingBooking, setUpdatingBooking] = useState(null);
  const [newCheckInDate, setNewCheckInDate] = useState('');
  const [startSlotLabel, setStartSlotLabel] = useState('');
  const [endSlotLabel, setEndSlotLabel] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [bookedSlotLabels, setBookedSlotLabels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await ApiService.getUserProfile();
        const userObj = response.user || response.data || response;
        const userPlusBookings = await ApiService.getUserBookings(userObj.id);
        setUser(userPlusBookings.user || userPlusBookings);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const slots = [];
    let hour = 8, minute = 0, id = 1;
    while (hour < 19) {
      const start = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      minute += 30;
      if (minute === 60) {
        hour += 1;
        minute = 0;
      }
      const end = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const label = `${formatTime(start)} - ${formatTime(end)}`;
      slots.push({ id: id++, label, start, end });
    }
    setAvailableTimeSlots(slots);
  }, []);

  useEffect(() => {
    if (newCheckInDate && updatingBooking && user?.bookings?.length > 0) {
      const booked = user.bookings
        .filter(b => b.id !== updatingBooking.id && b.checkInDate === newCheckInDate)
        .flatMap(b => b.timeSlots || [])
        .map(slot => slot.label);
      setBookedSlotLabels(booked);
    } else {
      setBookedSlotLabels([]);
    }
  }, [newCheckInDate, updatingBooking, user]);

  const formatTime = (time) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const min = m;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12.toString().padStart(2, '0')}:${min} ${ampm}`;
  };

  const handleLogout = () => {
    ApiService.logout();
    navigate('/home');
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleShowUpdateModal = (booking) => {
    setUpdatingBooking(booking);
    setNewCheckInDate(booking.checkInDate);
    setStartSlotLabel(booking.timeSlots?.[0]?.label || '');
    setEndSlotLabel(booking.timeSlots?.[booking.timeSlots.length - 1]?.label || '');
    setError('');
    setSuccess('');
    setShowUpdateModal(true);
  };

  const handleConfirmUpdate = async () => {
    if (!newCheckInDate || !startSlotLabel || !endSlotLabel) {
      setError("All fields are required.");
      return;
    }
    const startIdx = availableTimeSlots.findIndex(s => s.label === startSlotLabel);
    const endIdx = availableTimeSlots.findIndex(s => s.label === endSlotLabel);
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
      setError("Invalid time slot range.");
      return;
    }
    const selectedSlots = availableTimeSlots.slice(startIdx, endIdx + 1);
    if (selectedSlots.some(slot => bookedSlotLabels.includes(slot.label))) {
      setError("One or more selected slots are already booked.");
      return;
    }
    setError('');
    try {
      const payload = {
        bookingId: updatingBooking.id,
        checkInDate: newCheckInDate,
        timeSlotIds: selectedSlots.map(slot => slot.id)
      };
      const response = await ApiService.updateBooking(payload);
      if (response.statusCode === 200) {
        setSuccess(`Booking updated successfully! Confirmation Code: ${response.bookingConfirmationCode || updatingBooking.bookingConfirmationCode}`);
        setUser(prev => ({
          ...prev,
          bookings: prev.bookings.map(b => b.id === updatingBooking.id ? { ...b, checkInDate: newCheckInDate, timeSlots: selectedSlots } : b)
        }));
        setTimeout(() => {
          setShowUpdateModal(false);
          setSuccess('');
        }, 1000);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="profile-page container">
      <div className="header">
        {user && <h2>Welcome, {user.name}</h2>}
        <div className="profile-actions">
          <button className="edit-profile-button" onClick={handleEditProfile}>Edit Profile</button>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      {user && (
        <div className="profile-details">
          <h3>My Profile</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phoneNumber}</p>
        </div>
      )}

      <div className="bookings-section">
        <h3>Booking History</h3>
        <div className="booking-list">
          {user?.bookings?.length > 0 ? (
            user.bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <p><strong>Confirmation Code:</strong> {booking.bookingConfirmationCode}</p>
                <p><strong>Date:</strong> {booking.checkInDate}</p>
                <p><strong>Time Slots:</strong></p>
                <ul>
                  {booking.timeSlots?.length > 0 ? (
                    booking.timeSlots.map((slot, i) => (
                      <li key={i}>{slot.label || `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}</li>
                    ))
                  ) : <li>N/A</li>}
                </ul>
                <p><strong>Room Type:</strong> {booking.room?.roomType || 'N/A'}</p>
                {booking.room?.roomPhotoUrl && (
                  <img className="room-photo" src={booking.room.roomPhotoUrl} alt="Room" />
                )}
                <div className="booking-buttons">
                  <button className="update-button" onClick={() => handleShowUpdateModal(booking)}>Update</button>
                  <button className="cancel-button" onClick={async () => {
                    try {
                      await ApiService.cancelBooking(booking.id);
                      setUser(prev => ({
                        ...prev,
                        bookings: prev.bookings.filter(b => b.id !== booking.id)
                      }));
                    } catch (error) {
                      setError(error.response?.data?.message || error.message);
                    }
                  }}>Cancel</button>
                </div>
              </div>
            ))
          ) : <p>No bookings found.</p>}
        </div>
      </div>

      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Booking</h3>
            <label>New Date:</label>
            <input type="date" value={newCheckInDate} onChange={(e) => { setNewCheckInDate(e.target.value); setStartSlotLabel(''); setEndSlotLabel(''); }} />
            <label>Start Time:</label>
            <select value={startSlotLabel} onChange={e => { setStartSlotLabel(e.target.value); setEndSlotLabel(''); }}>
              <option value="">-- Select Start Time --</option>
              {availableTimeSlots.map(slot => (
                <option key={slot.id} value={slot.label} disabled={bookedSlotLabels.includes(slot.label)}>
                  {slot.label} {bookedSlotLabels.includes(slot.label) ? '(Booked)' : ''}
                </option>
              ))}
            </select>
            <label>End Time:</label>
            <select value={endSlotLabel} onChange={e => setEndSlotLabel(e.target.value)}>
              <option value="">-- Select End Time --</option>
              {availableTimeSlots.map((slot, idx) => {
                const isBooked = bookedSlotLabels.includes(slot.label);
                const startIdx = availableTimeSlots.findIndex(s => s.label === startSlotLabel);
                return (
                  <option
                    key={slot.id}
                    value={slot.label}
                    disabled={isBooked || (startSlotLabel && idx < startIdx)}
                  >
                    {slot.label} {isBooked ? '(Booked)' : ''}
                  </option>
                );
              })}
            </select>
            <div className="modal-actions">
              <button onClick={handleConfirmUpdate} className="confirm-btn">Confirm</button>
              <button onClick={() => setShowUpdateModal(false)} className="cancel-btn">Cancel</button>
            </div>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
          </div>
        </div>
      )}
    </div>
  );
}; 

export default ProfilePage;