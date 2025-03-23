
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import { 
  faLaptopCode, 
  faChartPie, 
  faUserGraduate, 
  faFileAlt 
} from '@fortawesome/free-solid-svg-icons';
import '../pages/LoginPage/LoginPage.css';

// Carousel content
const carouselItems = [
    {
      icon: faLaptopCode,
      title: "Centralized Platform",
      text: "Build assignments with all previous questions at your fingertips."
    },
    {
      icon: faChartPie,
      title: "Analytical Feedback",
      text: "Visualize performance metrics and preview assignment difficulty"
    },
    {
      icon: faUserGraduate,
      title: "Seamless Integration",
      text: "Connect assignments to Canvas, and import/export assignments with ease."
    }
];
  
function Carousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change slide every 5 seconds
  
      return () => clearInterval(interval);
    }, []);
  
    const currentItem = carouselItems[currentIndex];
  
    return (
      <div className="carousel-container">
        <div className="carousel-content">
          <div className="carousel-icon">
            <FontAwesomeIcon icon={currentItem.icon} />
          </div>
          <h2 className="carousel-title">{currentItem.title}</h2>
          <p className="carousel-text">{currentItem.text}</p>
          <div className="carousel-dots">
            {carouselItems.map((_, index) => (
              <div 
                key={index} 
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

export default Carousel;