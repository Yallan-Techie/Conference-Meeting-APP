package com.conference.booking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for transferring booking-related data between backend and frontend.
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingDTO {

    private Long id;

    // ✅ Date of booking
    private LocalDate checkInDate;

    // ✅ Generated after booking
    private String bookingConfirmationCode;

    // ✅ Room details for display (RoomDTO contains type/name/etc.)
    private RoomDTO room;

    // ✅ User details (like name, email)
    private UserDTO user;

    // ✅ Used for sending full slot info (startTime, endTime) to frontend
    private List<TimeSlotDTO> timeSlots;

    // ✅ Used when receiving booking request from frontend (just IDs)
    private List<Long> timeSlotIds;
}
