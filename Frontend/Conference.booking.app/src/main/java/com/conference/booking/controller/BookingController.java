package com.conference.booking.controller;

import com.conference.booking.dto.BookingDTO;
import com.conference.booking.dto.BookingUpdateDTO;
import com.conference.booking.dto.Response;
import com.conference.booking.entity.Booking;
import com.conference.booking.entity.TimeSlot;
import com.conference.booking.services.interfac.IBookingService;
import com.conference.booking.services.interfac.ITimeSlotService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    private IBookingService bookingService;

    @Autowired
    private ITimeSlotService timeSlotService;

    // ✅ Book a room with selected time slots
    @PostMapping("/book-room/{roomId}/{userId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    public ResponseEntity<Response> saveBookings(
            @PathVariable Long roomId,
            @PathVariable Long userId,
            @RequestBody BookingDTO bookingDTO) {

        Booking booking = new Booking();
        booking.setCheckInDate(bookingDTO.getCheckInDate());

        if (bookingDTO.getTimeSlotIds() != null && !bookingDTO.getTimeSlotIds().isEmpty()) {
            List<TimeSlot> timeSlots = timeSlotService.getTimeSlotsByIds(bookingDTO.getTimeSlotIds());
            booking.setTimeSlots(timeSlots);
        }

        Response response = bookingService.saveBooking(roomId, userId, booking);

        if (response.getStatusCode() == 200 && response.getData() instanceof Booking) {
            bookingService.sendBookingConfirmationEmail(userId, (Booking) response.getData());
        }

        return ResponseEntity.status(response.getStatusCode()).body(response);
    }


    // ✅ Get all bookings (admin and user)
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    public ResponseEntity<Response> getAllBookings() {
        Response response = bookingService.getAllBookings();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ✅ Get booking by confirmation code
    @GetMapping("/get-by-confirmation-code/{confirmationCode}")
    public ResponseEntity<Response> getBookingByConfirmationCode(@PathVariable String confirmationCode) {
        Response response = bookingService.findBookingByConfirmationCode(confirmationCode);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

//    Cancel a booking (user or admin)

            @DeleteMapping("/cancel/{bookingId}")
            @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
            public ResponseEntity<Response> cancelBooking(@PathVariable Long bookingId) {
            Response response = bookingService.cancelBooking(bookingId);
            return ResponseEntity.status(response.getStatusCode()).body(response);
            }




    // ✅ Update booking (time slots, date, etc.)
    @PutMapping("/update")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    public ResponseEntity<Response> updateBooking(@RequestBody BookingUpdateDTO bookingUpdateDto) {
        try {
            // Optional: validate the slot IDs actually exist
            List<Long> slotIds = bookingUpdateDto.getTimeSlotIds();
            if (slotIds != null && !slotIds.isEmpty()) {
                List<TimeSlot> validSlots = timeSlotService.getTimeSlotsByIds(slotIds);
//                if (validSlots.size() != slotIds.size()) {
//                    throw new RuntimeException("One or more time slot IDs are invalid");
//                }
            }

            Response response = bookingService.updateBooking(bookingUpdateDto);

            if (response.getStatusCode() == 200 && response.getData() instanceof Booking) {
                Booking updatedBooking = (Booking) response.getData();
                bookingService.sendBookingUpdateEmail(updatedBooking.getUser().getId(), updatedBooking);
            }

            return ResponseEntity.status(response.getStatusCode()).body(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new Response(400, e.getMessage()));
        }
    }



    @PostMapping("/room-details-book/{roomId}")
    public ResponseEntity<Response> bookRoom(
            @PathVariable Long roomId,
            @RequestBody BookingUpdateDTO dto) {
        dto.setRoomId(roomId);
        Response response = bookingService.updateBooking(dto);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

}
