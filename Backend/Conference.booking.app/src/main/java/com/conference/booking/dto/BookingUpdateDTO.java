package com.conference.booking.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * DTO used for updating a booking's check-in date and time slots.
 */
@Getter
@Setter
public class BookingUpdateDTO {

    private Long bookingId;             // Booking ID to update

    private String checkInDate;         // New check-in date in "yyyy-MM-dd" format

    private List<Long> timeSlotIds;     // List of selected time slot IDs (e.g., [1, 2, 3])

    private Long roomId;                // ✅ Add this field to hold room ID (fixes setRoomId())


}
