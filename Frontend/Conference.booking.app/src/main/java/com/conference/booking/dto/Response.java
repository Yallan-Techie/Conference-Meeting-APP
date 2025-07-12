package com.conference.booking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.Getter;

import java.util.List;

@Data
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {

    private int statusCode;
    private String message;

    private String token;
    private String role;
    private String expirationTime;
    private String bookingConfirmationCode;

    private UserDTO user;
    private RoomDTO room;
    private BookingDTO booking;
    private List<UserDTO> userList;
    private List<RoomDTO> roomList;
    private List<BookingDTO> bookingList;

    private Object data;

    // ✅ Custom constructor for statusCode and message
    public Response(int statusCode, String message) {
        this.statusCode = statusCode;
        this.message = message;
    }

    // ✅ Default constructor (needed for deserialization and default creation)
    public Response() {}
}
