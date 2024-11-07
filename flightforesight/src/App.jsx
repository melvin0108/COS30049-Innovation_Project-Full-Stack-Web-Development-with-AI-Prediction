import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CustomNavbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/home'; 
import Fare from './components/Fare';
import Delay from './components/Delay';

function App() {
  return (
    <Router>
      <div className="app-container">
        <CustomNavbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} /> 
            <Route path="/fare" element={<Fare />} />
            <Route path="/delay" element={<Delay />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
