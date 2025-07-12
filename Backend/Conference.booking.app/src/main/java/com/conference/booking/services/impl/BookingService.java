package com.conference.booking.services.impl;

import com.conference.booking.dto.BookingDTO;
import com.conference.booking.dto.BookingUpdateDTO;
import com.conference.booking.dto.Response;
import com.conference.booking.entity.Booking;
import com.conference.booking.entity.Room;
import com.conference.booking.entity.TimeSlot;
import com.conference.booking.entity.User;
import com.conference.booking.exception.OurException;
import com.conference.booking.repo.BookingRepository;
import com.conference.booking.repo.RoomRepository;
import com.conference.booking.repo.TimeSlotRepository;
import com.conference.booking.repo.UserRepository;
import com.conference.booking.services.interfac.IBookingService;
import com.conference.booking.utils.Utils;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class BookingService implements IBookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender javaMailSender;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Override
    public Response saveBooking(Long roomId, Long userId, Booking bookingRequest) {
        Response response = new Response();

        try {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new OurException("Room Not Found"));
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new OurException("User Not Found"));

            LocalDate bookingDate = bookingRequest.getCheckInDate();
            List<Long> slotIds = new ArrayList<>();
            for (TimeSlot slot : bookingRequest.getTimeSlots()) {
                slotIds.add(slot.getId());
            }

            // Step 1: Check if any of the requested time slots are already booked
            List<TimeSlot> conflictingSlots = timeSlotRepository.findBookedSlots(slotIds, bookingDate, roomId);
            if (!conflictingSlots.isEmpty()) {
                throw new OurException("One or more selected time slots are already booked.");
            }

            // Step 2: Fetch and mark slots as booked
            List<TimeSlot> finalSlots = new ArrayList<>();
            for (Long slotId : slotIds) {
                TimeSlot dbSlot = timeSlotRepository.findById(slotId)
                        .orElseThrow(() -> new OurException("Time slot not found"));
                dbSlot.setBooked(true);
                dbSlot.setRoom(room);
                dbSlot.setDate(bookingDate);
                timeSlotRepository.save(dbSlot);
                finalSlots.add(dbSlot);
            }

            bookingRequest.setTimeSlots(finalSlots);
            bookingRequest.setRoom(room);
            bookingRequest.setUser(user);
            bookingRequest.setBookingConfirmationCode(Utils.generateRandomConfirmationCode(10));

            bookingRepository.save(bookingRequest);
            sendBookingConfirmationEmail(userId, bookingRequest);

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setBookingConfirmationCode(bookingRequest.getBookingConfirmationCode());

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error saving booking: " + e.getMessage());
        }

        return response;
    }

    @Override
    public Response updateBooking(BookingUpdateDTO dto) {
        Response response = new Response();
        try {
            Booking booking = bookingRepository.findById(dto.getBookingId())
                    .orElseThrow(() -> new OurException("Booking not found"));

            // Reset old time slots
            for (TimeSlot oldSlot : booking.getTimeSlots()) {
                oldSlot.setBooked(false);
                oldSlot.setRoom(null);
                oldSlot.setDate(null);
                timeSlotRepository.save(oldSlot);
            }

            booking.setCheckInDate(LocalDate.parse(dto.getCheckInDate()));

            // Apply new time slots
            List<TimeSlot> updatedSlots = new ArrayList<>();
            for (Long id : dto.getTimeSlotIds()) {
                TimeSlot slot = timeSlotRepository.findById(id)
                        .orElseThrow(() -> new OurException("Slot ID " + id + " not found"));
                slot.setBooked(true);
                slot.setRoom(booking.getRoom());
                slot.setDate(booking.getCheckInDate());
                timeSlotRepository.save(slot);
                updatedSlots.add(slot);
            }
            booking.setTimeSlots(updatedSlots);

            bookingRepository.save(booking);
            sendBookingUpdateEmail(booking.getUser().getId(), booking);

            response.setStatusCode(200);
            response.setMessage("Booking updated successfully");
            response.setData(booking);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error updating booking: " + e.getMessage());
        }

        return response;
    }

    @Override
    public Response getAllBookings() {
        Response response = new Response();
        try {
            List<Booking> bookings = bookingRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
            List<BookingDTO> bookingDTOList = Utils.mapBookingListEntityToBookingListDTO(bookings);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setBookingList(bookingDTOList);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response cancelBooking(Long bookingId) {
        Response response = new Response();
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new OurException("Booking not found"));

            for (TimeSlot slot : booking.getTimeSlots()) {
                slot.setBooked(false);
                slot.setRoom(null);
                slot.setDate(null);
                timeSlotRepository.save(slot);
            }

            bookingRepository.deleteById(bookingId);
            response.setStatusCode(200);
            response.setMessage("Booking cancelled successfully");
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error cancelling booking: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response findBookingByConfirmationCode(String code) {
        Response response = new Response();
        try {
            Booking booking = bookingRepository.findByBookingConfirmationCode(code)
                    .orElseThrow(() -> new OurException("Booking not found for code: " + code));

            BookingDTO dto = Utils.mapBookingEntityToBookingDTO(booking);
            response.setStatusCode(200);
            response.setMessage("Booking found");
            response.setBooking(dto);
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error: " + e.getMessage());
        }
        return response;
    }

    @Override
    public void sendBookingConfirmationEmail(Long userId, Booking booking) {
        sendEmail(userId, booking, false);
    }

    @Override
    public void sendBookingUpdateEmail(Long userId, Booking booking) {
        sendEmail(userId, booking, true);
    }

    private void sendEmail(Long userId, Booking booking, boolean isUpdate) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new OurException("User not found"));

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(user.getEmail());
            helper.setSubject(isUpdate ? "Booking Updated - Conference Room" : "Booking Confirmation - Conference Room");

            DateTimeFormatter timeFormat = DateTimeFormatter.ofPattern("hh:mm a");
            StringBuilder slotDetails = new StringBuilder();

            if (booking.getTimeSlots() != null && !booking.getTimeSlots().isEmpty()) {
                slotDetails.append("\u23F2 Time Slots:\n");
                for (TimeSlot slot : booking.getTimeSlots()) {
                    slotDetails.append(" - ")
                            .append(slot.getStartTime().format(timeFormat))
                            .append(" to ")
                            .append(slot.getEndTime().format(timeFormat))
                            .append("\n");
                }
            }

            String body = "Dear " + user.getName() + ",\n\n" +
                    (isUpdate
                            ? "Your booking has been updated successfully:\n\n"
                            : "Your booking is confirmed:\n\n") +
                    "\uD83D\uDCCD Room: " + booking.getRoom().getRoomType() + "\n" +
                    "\uD83D\uDCC5 Date: " + booking.getCheckInDate() + "\n" +
                    slotDetails.toString() +
                    "\n\uD83D\uDD10 Booking Code: " + booking.getBookingConfirmationCode() + "\n\n" +
                    "Thank you for using our system.\n\n- Conference Booking Team";

            helper.setText(body);
            javaMailSender.send(message);
        } catch (Exception e) {
            System.out.println("\u274C Failed to send email: " + e.getMessage());
        }
    }


}