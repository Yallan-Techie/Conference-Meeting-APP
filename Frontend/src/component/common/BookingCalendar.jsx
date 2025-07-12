import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import ApiService from '../../service/ApiService';

const BookingCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await ApiService.getAllBookings();
        const bookings = response.bookingList; // ✅ Fix this

        console.log("📦 Bookings fetched:", bookings);

        const calendarEvents = [];

        bookings.forEach((booking) => {
          const date = booking.checkInDate;
          const roomType = booking.room?.roomType || 'Room';
          const bookingCode = booking.bookingConfirmationCode;

          const timeSlots = Array.isArray(booking.timeSlots) ? booking.timeSlots : [];

          timeSlots.forEach((slot) => {
            calendarEvents.push({
              title: `${slot.startTime} - ${slot.endTime}\n(${roomType})`,
              date: date,
              allDay: true,
              extendedProps: {
                confirmationCode: bookingCode,
              }
            });
          });
        });

        console.log("📅 Events for calendar:", calendarEvents);
        setEvents(calendarEvents);
      } catch (error) {
        console.error("❌ Failed to fetch bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>📅Booking Calendar</h2><br></br>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventColor="#0ee920ff"
        height="auto"
        eventDidMount={(info) => {
          const code = info.event.extendedProps.confirmationCode;
          if (code) {
            info.el.title = `Code: ${code}`;
          }
        }}
      />
    </div>
  );
};

export default BookingCalendar;
