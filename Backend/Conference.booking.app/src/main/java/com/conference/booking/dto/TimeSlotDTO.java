package com.conference.booking.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TimeSlotDTO {

    private Long id;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean booked;

    private String label;  // ✅ Add this line

    public TimeSlotDTO(Long id, LocalTime startTime, LocalTime endTime, boolean booked) {
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.booked = booked;
    }
}
