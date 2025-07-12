import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import Pagination from '../common/Pagination';

const ManageBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [bookingsPerPage] = useState(6);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await ApiService.getAllBookings();
                const allBookings = response.bookingList || [];
                setBookings(allBookings);
                setFilteredBookings(allBookings);
            } catch (error) {
                console.error('Error fetching bookings:', error.message);
            }
        };

        fetchBookings();
    }, []);

    useEffect(() => {
        filterBookings(searchTerm);
    }, [searchTerm, bookings]);

    const filterBookings = (term) => {
        if (term === '') {
            setFilteredBookings(bookings);
        } else {
            const filtered = bookings.filter((booking) =>
                booking.bookingConfirmationCode &&
                booking.bookingConfirmationCode.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredBookings(filtered);
        }
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className='bookings-container' style={{ padding: '20px' }}>
            <h2>All Bookings</h2>

            <div className='search-div' style={{ marginBottom: '20px' }}>
                <label htmlFor="searchInput"><strong>Filter by Booking Number:</strong></label>
                <input
                    id="searchInput"
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Enter booking number"
                    style={{
                        marginLeft: '10px',
                        padding: '8px',
                        borderRadius: '5px',
                        border: '1px solid #ccc'
                    }}
                />
            </div>

            <div className="booking-results" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {currentBookings.map((booking) => (
                    <div
                        key={booking.id}
                        className="booking-result-item"
                        style={{
                            padding: '20px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '10px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                    >
                        <p><strong>Booking Code:</strong> {booking.bookingConfirmationCode || 'N/A'}</p>
                        <p><strong>Check-in Date:</strong> {booking.checkInDate || 'N/A'}</p>
                        <p><strong>Time Slots:</strong><br />
                            {(booking.timeSlots && booking.timeSlots.length > 0)
                                ? booking.timeSlots.map((slot, index) =>
                                    <span key={index}>
                                        {slot.startTime} - {slot.endTime}<br />
                                    </span>
                                )
                                : 'No slots'}
                        </p>
                        <button
                            className="edit-room-button"
                            onClick={() => navigate(`/admin/edit-booking/${booking.bookingConfirmationCode}`)}
                            style={{
                                marginTop: '10px',
                                padding: '8px 16px',
                                backgroundColor: '#2980b9',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            View
                        </button>
                    </div>
                ))}
            </div>

            <Pagination
                roomsPerPage={bookingsPerPage}
                totalRooms={filteredBookings.length}
                currentPage={currentPage}
                paginate={paginate}
            />
        </div>
    );
};

export default ManageBookingsPage;
