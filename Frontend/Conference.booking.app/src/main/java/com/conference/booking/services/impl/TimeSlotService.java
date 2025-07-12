package com.conference.booking.services.impl;

import com.conference.booking.dto.TimeSlotDTO;
import com.conference.booking.entity.TimeSlot;
import com.conference.booking.repo.TimeSlotRepository;
import com.conference.booking.services.interfac.ITimeSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimeSlotService implements ITimeSlotService {

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    // ✅ Used for booking service to fetch slots by ID
    @Override
    public List<TimeSlot> getTimeSlotsByIds(List<Long> timeSlotIds) {
        return timeSlotRepository.findAllById(timeSlotIds);
    }

    // ✅ Fetch all slots for a specific room & date
    @Override
    public List<TimeSlotDTO> getAvailableTimeSlotsForRoom(Long roomId, LocalDate date) {
        List<TimeSlot> slots = timeSlotRepository.findByRoomIdAndDate(roomId, date);

        return slots.stream()
                .map(slot -> new TimeSlotDTO(
                        slot.getId(),
                        slot.getStartTime(),
                        slot.getEndTime(),
                        Boolean.TRUE.equals(slot.getBooked()) // ✅ fixed
                ))
                .collect(Collectors.toList());
    }
}
