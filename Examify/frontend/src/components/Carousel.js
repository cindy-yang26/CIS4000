
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import { 
  faLaptopCode, 
  faChartPie, 
  faUserGraduate, 
  faFileAlt 
} from '@fortawesome/free-solid-svg-icons';
import '../pages/LoginPage/LoginPage.css';

// Carousel content - you can modify this data as needed
const carouselItems = [
    {
      icon: faLaptopCode,
      title: "Create Interactive Assignments",
      text: "Build engaging quizzes, tests and assignments that keep students motivated."
    },
    {
      icon: faChartPie,
      title: "Track Student Progress",
      text: "Visualize performance data and identify areas for improvement."
    },
    {
      icon: faUserGraduate,
      title: "Personalized Learning",
      text: "Automatically adjust content based on individual student needs."
    },
    {
      icon: faFileAlt,
      title: "Easy Grading",
      text: "Save time with automatic grading and detailed feedback reports."
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