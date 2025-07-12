// RoomDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

const RoomDetailsPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();

  const [roomDetails, setRoomDetails] = useState({ bookings: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [bookedSlotLabels, setBookedSlotLabels] = useState([]);
  const [startSlotLabel, setStartSlotLabel] = useState('');
  const [endSlotLabel, setEndSlotLabel] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [alreadyBookedDetails, setAlreadyBookedDetails] = useState([]);

  useEffect(() => {
    const slots = [];
    let start = moment('08:00', 'HH:mm');
    const end = moment('19:00', 'HH:mm');
    let id = 1;
    while (start < end) {
      const next = moment(start).add(30, 'minutes');
      slots.push({
        id: id++,
        label: `${start.format('hh:mm A')} - ${next.format('hh:mm A')}`,
        startTime: start.format('HH:mm'),
        endTime: next.format('HH:mm'),
      });
      start = next;
    }
    setAvailableTimeSlots(slots);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await ApiService.getRoomById(roomId);
        const roomData = {
          ...response.room,
          bookings: response.room.bookings || [],
        };
        setRoomDetails(roomData);

        const userProfile = await ApiService.getUserProfile();
        setUserId(userProfile.user.id);
        setUserEmail(userProfile.user.email);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (roomId) fetchData();
  }, [roomId]);

  useEffect(() => {
    if (checkInDate && Array.isArray(roomDetails.bookings)) {
      const selectedDate = moment(checkInDate).format('YYYY-MM-DD');

      const bookedSlots = roomDetails.bookings
        .filter((b) => b.checkInDate === selectedDate)
        .flatMap((b) => Array.isArray(b.timeSlots) ? b.timeSlots : []);

      const labels = bookedSlots.map((slot) => slot.label);
      setBookedSlotLabels(labels);

      const bookedDetails = roomDetails.bookings
        .filter((b) => b.checkInDate === selectedDate)
        .map((b) => ({
          checkInDate: b.checkInDate,
          timeSlots: Array.isArray(b.timeSlots) ? b.timeSlots : [],
        }));

      setAlreadyBookedDetails(bookedDetails);
    } else {
      setBookedSlotLabels([]);
      setAlreadyBookedDetails([]);
    }
  }, [checkInDate, roomDetails]);

  useEffect(() => {
    if (startSlotLabel && endSlotLabel && Array.isArray(availableTimeSlots)) {
      const startIndex = availableTimeSlots.findIndex((s) => s.label === startSlotLabel);
      const endIndex = availableTimeSlots.findIndex((s) => s.label === endSlotLabel);

      if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
        const selectedDateStr = moment(checkInDate).format('YYYY-MM-DD');
        const now = moment();
        const isToday = selectedDateStr === now.format('YYYY-MM-DD');

        const rangeSlots = availableTimeSlots.slice(startIndex, endIndex + 1).filter((slot) => {
          const [startTime] = slot.label.split(' - ');
          const slotMoment = moment(`${selectedDateStr} ${startTime}`, 'YYYY-MM-DD hh:mm A');
          return !bookedSlotLabels.includes(slot.label) && (!isToday || slotMoment.isSameOrAfter(now));
        });

        setSelectedSlots(rangeSlots);
      } else {
        setSelectedSlots([]);
      }
    } else {
      setSelectedSlots([]);
    }

    // Debugging:
    console.log('Selected Range:', startSlotLabel, endSlotLabel);
    console.log('Available Slots:', availableTimeSlots.map(s => s.label));
    console.log('Selected Slots:', selectedSlots);
  }, [startSlotLabel, endSlotLabel, checkInDate, availableTimeSlots, bookedSlotLabels]);

  const sendBookingEmail = async (code) => {
    try {
      await ApiService.sendBookingConfirmationEmail(userEmail, {
        roomType: roomDetails.roomType,
        checkInDate: moment(checkInDate).format('DD/MM/YYYY'),
        timeSlots: selectedSlots.map((s) => s.label),
        confirmationCode: code,
      });
    } catch (e) {
      console.error('Failed to send email:', e.message);
    }
  };

  const acceptBooking = async () => {
    if (!checkInDate) {
      setErrorMessage('Please select a check-in date.');
      return;
    }

    if (selectedSlots.length === 0) {
      setErrorMessage('Please select a valid time slot range.');
      return;
    }

    try {
      const latestRoom = await ApiService.getRoomById(roomId);
      const selectedDate = moment(checkInDate).format('YYYY-MM-DD');
      const latestBookings = Array.isArray(latestRoom.room.bookings)
        ? latestRoom.room.bookings
        : [];

      const alreadyBookedLabels = latestBookings
        .filter((b) => b.checkInDate === selectedDate)
        .flatMap((b) => Array.isArray(b.timeSlots) ? b.timeSlots : [])
        .map((slot) => slot.label);

      const isConflict = selectedSlots.some((slot) =>
        alreadyBookedLabels.includes(slot.label)
      );
      if (isConflict) {
        setErrorMessage('Selected time slot is already booked. Please select a different time slot.');
        setTimeout(() => setErrorMessage(''), 1000);
        return;
      }

      const booking = {
        checkInDate: selectedDate,
        timeSlotIds: selectedSlots.map((slot) => slot.id),
      };

      const response = await ApiService.bookRoom(roomId, userId, booking);

      if (response.statusCode === 200) {
        const code = response.bookingConfirmationCode;
        setConfirmationCode(code);
        setShowMessage(true);
        setErrorMessage('');
        setSelectedSlots([]);
        setStartSlotLabel('');
        setEndSlotLabel('');
        await sendBookingEmail(code);

        setTimeout(() => {
          setShowMessage(false);
          navigate('/rooms');
        }, 1000);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      setErrorMessage(msg);
      console.error('Booking failed:', error);
    }
  };

  if (isLoading) return <p className="loading">Loading room details...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="room-details-booking">
      <h1 className="room-title">Room Booking</h1>

      <div className="room-card">
        <img src={roomDetails?.roomPhotoUrl} alt={roomDetails?.roomType} className="room-image" />
        <div className="room-info">
          <h2>{roomDetails?.roomType}</h2>
          <p>{roomDetails?.description}</p>
        </div>
      </div>

      <div className="booking-panel">
        <button onClick={() => setShowDatePicker(true)} className="primary-btn">Book Now</button>
        <button onClick={() => navigate('/rooms')} className="secondary-btn">Go Back</button>

        {showDatePicker && (
          <div className="booking-form">
            <DatePicker
              selected={checkInDate}
              onChange={(date) => {
                setCheckInDate(date);
                setStartSlotLabel('');
                setEndSlotLabel('');
                setSelectedSlots([]);
              }}
              placeholderText="Select Check-in Date"
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              className="datepicker-field"
            />

            {checkInDate && (
              <div className="slot-row-container">
                <div className="slot-left-panel">
                  <div className="dropdown-section">
                    <br /><label>Start Time:</label>
                    <select value={startSlotLabel} onChange={(e) => setStartSlotLabel(e.target.value)}>
                      <option value="">-- Select Start Time --</option>
                      {availableTimeSlots.map((slot, idx) => (
                        <option key={idx} value={slot.label} disabled={bookedSlotLabels.includes(slot.label)}>
                          {slot.label} {bookedSlotLabels.includes(slot.label) ? '(Booked)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="dropdown-section">
                    <br /><label>End Time:</label>
                    <select value={endSlotLabel} onChange={(e) => setEndSlotLabel(e.target.value)}>
                      <option value="">-- Select End Time --</option>
                      {availableTimeSlots.map((slot, idx) => {
                        const isBooked = bookedSlotLabels.includes(slot.label);
                        const startIndex = availableTimeSlots.findIndex((s) => s.label === startSlotLabel);
                        const isInvalidRange = startSlotLabel && idx < startIndex;
                        return (
                          <option key={idx} value={slot.label} disabled={isBooked || isInvalidRange}>
                            {slot.label} {isBooked ? '(Booked)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="slot-summary">
                  <h4>Selected Time Slots:</h4>
                {selectedSlots.length > 0 && (
    <ul>
      {selectedSlots.map((slot, index) => (
        <li key={index} className="selected-slot">{slot.label}</li>
      ))}
    </ul>
  )}
</div>


                  <br />
                  <button onClick={acceptBooking} className="confirm-booking">Confirm Booking</button>
                  {errorMessage && <p className="error-text">{errorMessage}</p>}
                </div>

                {alreadyBookedDetails.length > 0 && (
                  <div className="booked-slots-section">
                    <h4>Already Booked:</h4><br />
                    {alreadyBookedDetails.map((booking, idx) => (
                      <div key={idx}>
                        <p><strong>Check-in Date:</strong> {booking.checkInDate}</p>
                        <p><strong>Time Slots:</strong><br />
                          {(booking.timeSlots || []).map((slot, i) => (
                            <span key={i}>{slot.startTime} - {slot.endTime}<br /></span>
                          ))}
                        </p><br />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showMessage && (
        <div className="success-banner bottom-toast">
          <p>😃 Booking successful! Confirmation Code: <strong>{confirmationCode}</strong></p>
        </div>
      )}
    </div>
  );
};

export default RoomDetailsPage;
