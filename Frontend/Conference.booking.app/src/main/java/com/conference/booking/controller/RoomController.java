package com.conference.booking.controller;

import com.conference.booking.dto.Response;
import com.conference.booking.dto.TimeSlotDTO;
import com.conference.booking.services.interfac.IBookingService;
import com.conference.booking.services.interfac.IRoomService;
import com.conference.booking.services.interfac.ITimeSlotService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/rooms")
public class RoomController {

    @Autowired
    private IRoomService roomService;

    @Autowired
    private IBookingService bookingService;

    @Autowired
    private ITimeSlotService timeSlotService;

    // ✅ Add new room
    @PostMapping("/add")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> addNewRoom(
            @RequestParam("photo") MultipartFile photo,
            @RequestParam("roomType") String roomType,
            @RequestParam(value = "roomDescription", required = false) String roomDescription
    ) {
        if (photo == null || photo.isEmpty() || roomType == null || roomType.isBlank()) {
            Response response = new Response();
            response.setStatusCode(400);
            response.setMessage("Please provide required fields: photo and roomType.");
            return ResponseEntity.badRequest().body(response);
        }

        Response response = roomService.addNewRoom(photo, roomType, roomDescription);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ✅ Get all rooms
    @GetMapping("/all")
    public ResponseEntity<Response> getAllRooms() {
        Response response = roomService.getAllRooms();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ✅ Get room types
    @GetMapping("/types")
    public List<String> getRoomTypes() {
        return roomService.getAllRoomTypes();
    }

    // ✅ Get room by ID (used by frontend room detail page)
    @GetMapping("/room-by-id/{roomId}")
    public ResponseEntity<Response> getRoomById(@PathVariable Long roomId) {
        Response response = roomService.getRoomById(roomId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ✅ Get all available rooms
    @GetMapping("/all-available-rooms")
    public ResponseEntity<Response> getAvailableRooms() {
        Response response = roomService.getAllAvailableRooms();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ✅ Get available rooms by check-in/out date and type
    @GetMapping("/available-rooms-by-date-and-type")
    public ResponseEntity<Response> getAvailableRoomsByDateAndType(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
            @RequestParam String roomType
    ) {
        if (checkInDate == null || roomType == null || roomType.isBlank() || checkOutDate == null) {
            Response response = new Response();
            response.setStatusCode(400);
            response.setMessage("Please provide checkInDate, checkOutDate and roomType.");
            return ResponseEntity.badRequest().body(response);
        }

        Response response = roomService.getAvailableRoomsByDataAndType(checkInDate, checkOutDate, roomType);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ✅ Update room
    @PutMapping("/update/{roomId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> updateRoom(@PathVariable Long roomId,
                                               @RequestParam(value = "photo", required = false) MultipartFile photo,
                                               @RequestParam(value = "roomType", required = false) String roomType,
                                               @RequestParam(value = "roomDescription", required = false) String roomDescription) {
        Response response = roomService.updateRoom(roomId, roomDescription, roomType, photo);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ✅ Delete room
    @DeleteMapping("/delete/{roomId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteRoom(@PathVariable Long roomId) {
        Response response = roomService.deleteRoom(roomId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ✅ MAIN FEATURE: Fetch time slots for a room on a given date
    @GetMapping("/{roomId}/available-time-slots")
    public ResponseEntity<List<TimeSlotDTO>> getAvailableTimeSlotsByRoomAndDate(
            @PathVariable Long roomId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<TimeSlotDTO> slots = timeSlotService.getAvailableTimeSlotsForRoom(roomId, date);
        return ResponseEntity.ok(slots);
    }
}
