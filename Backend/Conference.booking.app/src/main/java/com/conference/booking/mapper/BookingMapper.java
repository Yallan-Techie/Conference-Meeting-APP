package com.conference.booking.mapper;

import com.conference.booking.dto.*;
import com.conference.booking.entity.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class BookingMapper {

    public static BookingDTO toDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setBookingConfirmationCode(booking.getBookingConfirmationCode());

        // ✅ Room mapping
        if (booking.getRoom() != null) {
            Room room = booking.getRoom();
            RoomDTO roomDTO = new RoomDTO();
            roomDTO.setId(room.getId());
            roomDTO.setRoomType(room.getRoomType());
            roomDTO.setRoomPhotoUrl(room.getRoomPhotoUrl());
            roomDTO.setRoomDescription(room.getRoomDescription());
            dto.setRoom(roomDTO);
        }

        // ✅ User mapping
        if (booking.getUser() != null) {
            User user = booking.getUser();
            UserDTO userDTO = new UserDTO();
            userDTO.setId(user.getId());
            userDTO.setName(user.getName());
            userDTO.setEmail(user.getEmail());
            userDTO.setPhoneNumber(user.getPhoneNumber());
            userDTO.setRole(user.getRole());
            dto.setUser(userDTO);
        }

        // ✅ Time slots mapping
        List<TimeSlotDTO> timeSlotDTOs = (booking.getTimeSlots() != null)
                ? booking.getTimeSlots().stream().map(slot -> {
            TimeSlotDTO tsDTO = new TimeSlotDTO();
            tsDTO.setId(slot.getId());
            tsDTO.setStartTime(slot.getStartTime());
            tsDTO.setEndTime(slot.getEndTime());

            // Optional: label for frontend
            tsDTO.setLabel(slot.getStartTime() + " - " + slot.getEndTime());

            return tsDTO;
        }).collect(Collectors.toList())
                : new ArrayList<>();

        dto.setTimeSlots(timeSlotDTOs);

        return dto;
    }
}
