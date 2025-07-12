package com.conference.booking.utils;

import com.conference.booking.dto.BookingDTO;
import com.conference.booking.dto.RoomDTO;
import com.conference.booking.dto.TimeSlotDTO;
import com.conference.booking.dto.UserDTO;
import com.conference.booking.entity.Booking;
import com.conference.booking.entity.Room;
import com.conference.booking.entity.TimeSlot;
import com.conference.booking.entity.User;

import java.security.SecureRandom;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

public class Utils {

    private static final String ALPHANUMERIC_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom secureRandom = new SecureRandom();

    public static String generateRandomConfirmationCode(int length) {
        StringBuilder stringBuilder = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int randomIndex = secureRandom.nextInt(ALPHANUMERIC_STRING.length());
            char randomChar = ALPHANUMERIC_STRING.charAt(randomIndex);
            stringBuilder.append(randomChar);
        }
        return stringBuilder.toString();
    }

    public static UserDTO mapUserEntityToUserDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setRole(user.getRole());
        return userDTO;
    }

    public static RoomDTO mapRoomEntityToRoomDTO(Room room) {
        RoomDTO roomDTO = new RoomDTO();
        roomDTO.setId(room.getId());
        roomDTO.setRoomType(room.getRoomType());
        roomDTO.setRoomPhotoUrl(room.getRoomPhotoUrl());
        roomDTO.setRoomDescription(room.getRoomDescription());
        return roomDTO;
    }

    public static BookingDTO mapBookingEntityToBookingDTO(Booking booking) {
        BookingDTO bookingDTO = new BookingDTO();
        bookingDTO.setId(booking.getId());
        bookingDTO.setCheckInDate(booking.getCheckInDate());
        bookingDTO.setBookingConfirmationCode(booking.getBookingConfirmationCode());

        if (booking.getTimeSlots() != null && !booking.getTimeSlots().isEmpty()) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");

            List<TimeSlotDTO> timeSlotDTOs = booking.getTimeSlots().stream()
                    .map(slot -> {
                        TimeSlotDTO dto = new TimeSlotDTO(
                                slot.getId(),
                                slot.getStartTime(),
                                slot.getEndTime(),
                                Boolean.TRUE.equals(slot.getBooked())
                        );
                        // ✅ Label set: "09:00 AM - 10:00 AM"
                        String label = slot.getStartTime().format(formatter) + " - " + slot.getEndTime().format(formatter);
                        dto.setLabel(label);
                        return dto;
                    })
                    .collect(Collectors.toList());

            List<Long> slotIds = booking.getTimeSlots().stream()
                    .map(TimeSlot::getId)
                    .collect(Collectors.toList());

            bookingDTO.setTimeSlots(timeSlotDTOs);
            bookingDTO.setTimeSlotIds(slotIds);
        }

        if (booking.getRoom() != null) {
            bookingDTO.setRoom(mapRoomEntityToRoomDTO(booking.getRoom()));
        }

        if (booking.getUser() != null) {
            bookingDTO.setUser(mapUserEntityToUserDTO(booking.getUser()));
        }

        return bookingDTO;
    }

    public static RoomDTO mapRoomEntityToRoomDTOPlusBookings(Room room) {
        RoomDTO roomDTO = mapRoomEntityToRoomDTO(room);
        if (room.getBookings() != null) {
            roomDTO.setBookings(room.getBookings().stream()
                    .map(Utils::mapBookingEntityToBookingDTO)
                    .collect(Collectors.toList()));
        }
        return roomDTO;
    }

    public static BookingDTO mapBookingEntityToBookingDTOPlusBookedRooms(Booking booking, boolean mapUser) {
        BookingDTO bookingDTO = mapBookingEntityToBookingDTO(booking);

        if (mapUser && booking.getUser() != null) {
            bookingDTO.setUser(mapUserEntityToUserDTO(booking.getUser()));
        }

        if (booking.getRoom() != null) {
            bookingDTO.setRoom(mapRoomEntityToRoomDTO(booking.getRoom()));
        }

        return bookingDTO;
    }

    public static UserDTO mapUserEntityToUserDTOPlusUserBookingsAndRoom(User user) {
        UserDTO userDTO = mapUserEntityToUserDTO(user);

        if (user.getBookings() != null && !user.getBookings().isEmpty()) {
            userDTO.setBookings(user.getBookings().stream()
                    .map(booking -> mapBookingEntityToBookingDTOPlusBookedRooms(booking, false))
                    .collect(Collectors.toList()));
        }

        return userDTO;
    }

    public static List<UserDTO> mapUserListEntityToUserListDTO(List<User> userList) {
        return userList.stream()
                .map(Utils::mapUserEntityToUserDTO)
                .collect(Collectors.toList());
    }

    public static List<RoomDTO> mapRoomListEntityToRoomListDTO(List<Room> roomList) {
        return roomList.stream()
                .map(Utils::mapRoomEntityToRoomDTO)
                .collect(Collectors.toList());
    }

    public static List<BookingDTO> mapBookingListEntityToBookingListDTO(List<Booking> bookingList) {
        return bookingList.stream()
                .map(Utils::mapBookingEntityToBookingDTO)
                .collect(Collectors.toList());
    }

    public static List<TimeSlotDTO> mapTimeSlotListToDTO(List<TimeSlot> slots) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");

        return slots.stream()
                .map(slot -> {
                    TimeSlotDTO dto = new TimeSlotDTO(
                            slot.getId(),
                            slot.getStartTime(),
                            slot.getEndTime(),
                            Boolean.TRUE.equals(slot.getBooked())
                    );
                    // ✅ Label set here too
                    String label = slot.getStartTime().format(formatter) + " - " + slot.getEndTime().format(formatter);
                    dto.setLabel(label);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
