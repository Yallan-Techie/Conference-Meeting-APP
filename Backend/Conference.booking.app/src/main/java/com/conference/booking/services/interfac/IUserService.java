package com.conference.booking.services.interfac;


import com.conference.booking.dto.LoginRequest;
import com.conference.booking.dto.Response;
import com.conference.booking.entity.User;

public interface IUserService {
    Response register(User user);

    Response login(LoginRequest loginRequest);

    Response getAllUsers();

    Response getUserBookingHistory(String userId);

    Response deleteUser(String userId);

    Response getUserById(String userId);

    Response getMyInfo(String email);

}