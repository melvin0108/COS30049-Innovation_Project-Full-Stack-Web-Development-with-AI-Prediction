// src/components/Navbar.jsx
import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './components.css'; 
import { Link } from 'react-router-dom';

function CustomNavbar() {
  return (
    <Navbar bg="light" expand="lg" className="navbar-container px-4">
      <Navbar.Brand as={Link} to="/" className="navbar-brand">
        FlightForesight
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav>
          <Nav.Link as={Link} to="/" className="btn btn-outline-primary navbar-button">
            Home
          </Nav.Link>
          <Nav.Link as={Link} to="/fare" className="btn btn-outline-primary navbar-button">
            Fare
          </Nav.Link>
          <Nav.Link as={Link} to="/delay" className="btn btn-outline-primary navbar-button">
            Delay
          </Nav.Link>
          <Nav.Link href="https://github.com/EichanInIt/COS30049-Computing-Technology-Innovation-Project_FlightForesight" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary navbar-button">
            Github
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default CustomNavbar;
