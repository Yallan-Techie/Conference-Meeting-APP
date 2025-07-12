package com.conference.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date must be today or in the future")
    private LocalDate checkInDate;

    private String bookingConfirmationCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToMany
    @JoinTable(
            name = "booking_time_slots",
            joinColumns = @JoinColumn(name = "booking_id"),
            inverseJoinColumns = @JoinColumn(name = "time_slot_id")
    )
    private List<TimeSlot> timeSlots;


    /**
     * Used only for accepting time slot IDs from the frontend during request.
     * Not persisted in the database.
     */
    @Transient
    private List<Long> timeSlotIds;

    @Override
    public String toString() {
        return "Booking{" +
                "id=" + id +
                ", checkInDate=" + checkInDate +
                ", bookingConfirmationCode='" + bookingConfirmationCode + '\'' +
                ", userId=" + (user != null ? user.getId() : null) +
                ", roomId=" + (room != null ? room.getId() : null) +
                ", timeSlotCount=" + (timeSlots != null ? timeSlots.size() : 0) +
                '}';
    }
}
