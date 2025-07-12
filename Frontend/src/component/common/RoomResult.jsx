// RoomResult.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';

const RoomResult = ({ roomSearchResults }) => {
  const navigate = useNavigate();
  const isAdmin = ApiService.isAdmin();

  return (
    <section className="room-results">
      {roomSearchResults && roomSearchResults.length > 0 ? (
        <div className="room-list">
          {roomSearchResults.map(room => (
            <div key={room.id} className="room-card">
              <div className="room-img-wrapper">
                <img
                  src={room.roomPhotoUrl}
                  alt={room.roomType}
                  className="room-img"
                />
              </div>

              <div className="room-info">
                <h3 className="room-title">{room.roomType}</h3>
                <p className="room-desc">{room.roomDescription}</p>
              </div>

              <div className="room-action">
                {isAdmin ? (
                  <button
                    className="room-btn edit-btn"
                    onClick={() => navigate(`/admin/edit-room/${room.id}`)}
                  >
                    Edit Room
                  </button>
                ) : (
                  <button
                    className="room-btn view-btn"
                    onClick={() => navigate(`/room-details-book/${room.id}`)}
                  >
                    View
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="room-detail-loading">No rooms found for your search.</p>
      )}
    </section>
  );
};

export default RoomResult;
