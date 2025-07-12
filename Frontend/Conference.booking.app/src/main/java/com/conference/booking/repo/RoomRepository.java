package com.conference.booking.repo;

import com.conference.booking.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    @Query("SELECT DISTINCT r.roomType FROM Room r")
    List<String> findDistinctRoomTypes();

    /**
     * ✅ Returns rooms of a given type that are available on a specific date,
     * excluding rooms already booked for that day (regardless of time slots).
     */
    @Query("""
        SELECT r FROM Room r
        WHERE r.roomType LIKE %:roomType%
        AND r.id NOT IN (
            SELECT bk.room.id FROM Booking bk
            WHERE bk.checkInDate = :bookingDate
        )
    """)
    List<Room> findAvailableRoomsByDateAndType(LocalDate bookingDate, String roomType);

    /**
     * ✅ Returns rooms that have never been booked.
     */
    @Query("SELECT r FROM Room r WHERE r.id NOT IN (SELECT b.room.id FROM Booking b)")
    List<Room> getAllAvailableRooms();
}
