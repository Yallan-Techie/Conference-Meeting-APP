package com.conference.booking.services.interfac;

import com.conference.booking.dto.BookingDTO;
import com.conference.booking.dto.BookingUpdateDTO;
import com.conference.booking.dto.Response;
import com.conference.booking.entity.Booking;

public interface IBookingService {

    // Save a new booking
    Response saveBooking(Long roomId, Long userId, Booking bookingRequest);

    // Find booking by confirmation code
    Response findBookingByConfirmationCode(String confirmationCode);

    // Get all bookings
    Response getAllBookings();

    // Cancel a booking by its ID
    Response cancelBooking(Long bookingId);

    // Update a booking with new date and time slot ids
    Response updateBooking(BookingUpdateDTO bookingUpdateDTO);

    // Send confirmation email to user after booking
    void sendBookingConfirmationEmail(Long userId, Booking bookingData);

    // ✅ Send update email to user after updating booking
    void sendBookingUpdateEmail(Long userId, Booking bookingData);

}
