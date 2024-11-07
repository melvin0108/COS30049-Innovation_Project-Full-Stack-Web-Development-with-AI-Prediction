// src/components/Footer.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import './components.css'; 

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-text">
          <p>&copy; {new Date().getFullYear()} Swinburne University of Technology.</p>
          <p>Made by Civil Aviation Association</p>
        </div>
        <div className="footer-icons">
          <a href="https://github.com/EichanInIt/COS30049-Computing-Technology-Innovation-Project_FlightForesight" target="_blank" rel="noopener noreferrer" className="footer-icon">
            <FontAwesomeIcon icon={faGithub} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
