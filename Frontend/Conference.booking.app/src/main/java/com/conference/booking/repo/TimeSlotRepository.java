package com.conference.booking.repo;

import com.conference.booking.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    // Existing method
    Optional<TimeSlot> findByStartTimeAndEndTime(LocalTime startTime, LocalTime endTime);

    // ✅ Fetch all time slots for a given room and date
    List<TimeSlot> findByRoomIdAndDate(Long roomId, LocalDate date);

    // ✅ Corrected: Find conflicting (already booked) slots for room and date
    @Query("SELECT ts FROM TimeSlot ts WHERE ts.id IN :slotIds AND ts.date = :date AND ts.room.id = :roomId AND ts.booked = true")
    List<TimeSlot> findBookedSlots(@Param("slotIds") List<Long> slotIds,
                                   @Param("date") LocalDate date,
                                   @Param("roomId") Long roomId);
}
