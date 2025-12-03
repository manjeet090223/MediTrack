
import React from "react";
import Slider from "react-slick";
import "./AppointmentsCarousel.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function AppointmentsCarousel({ appointments }) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="carousel-container">
      <h3>Upcoming Appointments</h3>
      <Slider {...settings}>
        {appointments.map((appt) => (
          <div className="appt-card" key={appt._id}>
            <h4>{appt.doctor?.name || "-"}</h4>
            <p>{new Date(appt.datetime).toLocaleString()}</p>
            <p>Status: {appt.status}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
}
