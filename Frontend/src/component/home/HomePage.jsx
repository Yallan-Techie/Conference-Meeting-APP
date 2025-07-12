import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoomResult from "../common/RoomResult";
import RoomSearch from "../common/RoomSearch";


const HomePage = () => {
  const [roomSearchResults, setRoomSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearchResult = (results) => {
    setRoomSearchResults(results);
  };

 const handleBookNow = () => {
  navigate('/rooms');
};
  const roomGallery = [
    {
      id: 1,
      img: "./assets/images/h-1.jpg",
      title: "Executive Conference Hall",
      desc: "Perfect for board meetings and strategy sessions with sleek interiors and AV equipment.",
    },
    {
      id: 2,
      img: "./assets/images/h-2.jpg",
      title: "Creative Collaboration Room",
      desc: "Designed to spark innovation, ideal for workshops and brainstorming.",
    },
    {
      id: 3,
      img: "./assets/images/h-3.jpg",
      title: "Premium Meeting Suite",
      desc: "Luxurious setting for high-profile meetings and executive decisions.",
    },
    {
      id: 4,
      img: "./assets/images/h-4.jpg",
      title: "Compact Team Room",
      desc: "Efficient and modern setup for small team stand-ups and client calls.",
    },
    {
      id: 5,
      img: "./assets/images/h-5.jpg",
      title: "Multipurpose Conference Zone",
      desc: "Spacious and flexible layout ideal for training, seminars, or events.",
    },
  ];

  return (
    <div className="home">
      {/* Banner Section */}
      <section className="banner-section">
        <img src="./assets/images/hotel.webp" alt="Conference Room" className="banner-image" />
        <div className="banner-overlay">
          <div className="banner-content">
            <h1><span className="highlight-text">Welcome to Conference Room Booking</span></h1>
            <p>Find, book, and manage your meetings in just a few clicks.</p>
          </div>
        </div>
      </section>

      {/* Room Search */}
      <section className="room-search-section">
        <RoomSearch onSearch={handleSearchResult} />
        {roomSearchResults.length > 0 && <RoomResult results={roomSearchResults} />}
      </section>

      {/* Intro Section */}
      <section className="intro-section">
        <div className="intro-content">
          <h2>Smart. Simple. Seamless Booking.</h2>
          <p>
            Experience the future of meeting management with our intuitive platform. Whether you're a small team or a large enterprise, our system helps you find the perfect space, check real-time availability, and reserve it in seconds — all without any hassle.
          </p>
          <div className="intro-stats">
            <div className="stat-box"><h3>500+</h3><p>Meetings Hosted</p></div>
            <div className="stat-box"><h3>50+</h3><p>Premium Rooms</p></div>
            <div className="stat-box"><h3>99.9%</h3><p>Customer Satisfaction</p></div>
          </div>
        </div>
      </section>

      {/* Room Gallery Section */}
      <section className="gallery-section">
        <h2 className="section-title">Explore Our Rooms</h2>
        <div className="gallery-scroll">
          {roomGallery.map((room) => (
            <div className="gallery-card" key={room.id}>
              <img src={room.img} alt={room.title} />
              <div className="gallery-info">
                <h3>{room.title}</h3>
                <p>{room.desc}</p>
                <button onClick={() => handleBookNow(room.id)} className="book-btn">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Facilities Section */}
      <section className="service-section">
        <h2 className="section-title">Our Facilities</h2>
        <div className="service-cards">
          {[
            {
              img: "./assets/images/wifi.png",
              title: "High-Speed Wi-Fi",
              desc: "Seamless internet access for all your conference needs."
            },
            {
              img: "./assets/images/ac.png",
              title: "Air-Conditioned Rooms",
              desc: "Comfortable, climate-controlled meeting environments."
            },
            {
              img: "./assets/images/parking.png",
              title: "Secure Parking",
              desc: "Spacious and safe parking area for all guests."
            },
            {
              img: "./assets/images/refershment.jpg",
              title: "Refreshments",
              desc: "Complimentary tea, coffee, and snacks available."
            }
          ].map((service, index) => (
            <div className="service-card" key={index}>
              <img src={service.img} alt={service.title} />
              <div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <h2 className="section-title">Why Choose Us?</h2>
        <p>
          Our conference room booking system simplifies the scheduling process for businesses and professionals. Whether it’s a meeting, seminar, or workshop, we offer real-time availability, modern facilities, and exceptional service.
        </p>
      </section>
    </div>
  );
};

export default HomePage;
