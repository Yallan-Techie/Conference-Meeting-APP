package com.conference.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Data
@NoArgsConstructor
@Entity
@Table(name = "time_slot")
public class TimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Start time is required")
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "is_booked", nullable = false)
    private Boolean booked = false;

    @Column(name = "date")
    private LocalDate date;

    // ✅ Foreign Key Mapping for room_id
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "room_id", referencedColumnName = "id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_time_slot_room"))
    private Room room;

    // ✅ Bidirectional Mapping to Booking
    @ManyToMany(mappedBy = "timeSlots", fetch = FetchType.EAGER)
    private List<Booking> bookings;

    // Constructor for time slot
    public TimeSlot(LocalTime startTime, LocalTime endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.booked = false;
    }

    // Time range parser
    public static TimeSlot fromString(String slotRange) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
            String[] parts = slotRange.split(" - ");
            LocalTime start = LocalTime.parse(parts[0].trim(), formatter);
            LocalTime end = LocalTime.parse(parts[1].trim(), formatter);
            return new TimeSlot(start, end);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid time slot format: " + slotRange);
        }
    }

    public boolean isBooked() {
        return Boolean.TRUE.equals(booked);
    }

    public void setBooked(Boolean booked) {
        this.booked = booked != null ? booked : false;
    }
}
