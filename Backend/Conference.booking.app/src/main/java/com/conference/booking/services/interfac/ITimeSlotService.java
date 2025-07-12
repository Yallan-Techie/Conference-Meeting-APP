package com.conference.booking.services.interfac;

import com.conference.booking.dto.TimeSlotDTO;
import com.conference.booking.entity.TimeSlot;

import java.time.LocalDate;
import java.util.List;

public interface ITimeSlotService {
    // Existing method
    List<TimeSlot> getTimeSlotsByIds(List<Long> timeSlotIds);

    // ✅ New method to get available time slots by room and date
    List<TimeSlotDTO> getAvailableTimeSlotsForRoom(Long roomId, LocalDate date);
}
