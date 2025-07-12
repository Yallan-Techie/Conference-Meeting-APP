package com.conference.booking.repo;

import com.conference.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    // ✅ Add this method
    Optional<Booking> findByBookingConfirmationCode(String bookingConfirmationCode);
}
