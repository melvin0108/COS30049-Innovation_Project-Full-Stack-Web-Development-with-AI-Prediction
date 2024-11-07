// src/components/Fare.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  CircularProgress,
  Autocomplete,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { motion } from "framer-motion";
import FlightPath from './FlightPath';
import axios from 'axios';
import FlightTableForFare from "./FlightTableForFare";

const Fare = () => {
  // State variables to manage form inputs, loading states, and fetched data
  const [airline, setAirlines] = useState([]);
  const [selectedAirline, setSelectedAirline] = useState("");
  const [airports, setAirports] = useState([]);
  const [stops, setStops] = useState("");
  const [sourceCity, setSourceCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [buyTicketDate, setBuyTicketDate] = useState("");
  const [Class, setFlightClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmations, setConfirmations] = useState([]);
  const [flightPath, setFlightPath] = useState([]);
  const [pathVisible, setPathVisible] = useState(false);
  const [flightTable, setFlightTable] = useState(null); 

  // Fetch the airport and airline data from a local JSON file when the component mounts
  const fetchAirportsData = async () => {
    try {
      const response = await fetch("airports.json"); 
      const data = await response.json();
      setAirports(data);
    } catch (error) {
      console.error("Airports data cannot be fetched:", error);
    }
  };

  const fetchAirlinesData = async () => {
    try {
      const response = await fetch("airlines.json"); 
      const data = await response.json();
      setAirlines(data);
    } catch (error) {
      console.error("Airlines data cannot be fetched:", error);
    }
  };

  useEffect(() => {
    fetchAirportsData();
    fetchAirlinesData();
  }, []);

  // Handle form submission, initiate fare prediction
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const source_city = airports.find((airport) => airport.iata === sourceCity);
    const destination_city = airports.find((airport) => airport.iata === destinationCity);
  
    // Validate that source and destination cities are not the same
    if (source_city.city === destination_city.city) {
      alert("Please select different cities.");
      setLoading(false);
      return;
    }

    // Convert the date and time inputs to Date objects
    const departureDateTime = new Date(departureDate);
    const arrivalDateTime = new Date(arrivalDate);

    // Ensure arrival time is after departure time
    if (arrivalDateTime <= departureDateTime) {
      alert("Arrival time must be after the departure time.");
      setLoading(false);
      return;
    }

    // Calculate the flight duration (in hours)
    const duration_in_milliseconds = arrivalDateTime - departureDateTime;
    const duration_in_hours = Math.abs(duration_in_milliseconds) / (1000 * 60 * 60); // Convert ms to hours

    // Calculate the days left before departure
    const day_buy_ticket = new Date(buyTicketDate); // Get today's date
    const days_before_departure = Math.ceil((departureDateTime - day_buy_ticket) / (1000 * 60 * 60 * 24)); // Calculate days left

    // Validate that the day you bought the ticket is before the departure time
    if (departureDateTime < day_buy_ticket) {
      alert("The day you bought the ticket must be before the departure time.");
      setLoading(false);
      return;
    }
  
    // Construct data payload for API requests
    const originalData = {
      airline: selectedAirline,
      sourceCity: source_city.city,
      departureTime,
      stops,
      arrivalTime,
      destinationCity: destination_city.city,
      flightClass: Class,
      duration: parseFloat(duration_in_hours),
      days_left: days_before_departure
  };

  console.log("Submitting Data:", originalData);

  try {
      // Fetch predicted fare for the original scenario
      const response = await axios.post("http://localhost:8000/fare/predict/", originalData, {
          headers: {
              "Content-Type": "application/json"
          }
      });
      console.log("Predicted Fare:", response.data.predicted_fare);

      // Add predicted fare to the original data
      const originalRecordWithFare = { ...originalData, fare: response.data.predicted_fare, isOriginal: true };

      // Store confirmations starting with the original record
      const allConfirmations = [originalRecordWithFare];

      // Define the time periods for departure
      const timePeriods = [
          { daysleft: "0" },
          { daysleft: "1" },
          { daysleft: "7" },
          { daysleft: "14" },
          { daysleft: "30" },
      ];

      // Loop through the time periods to fetch predicted fares
      for (const period of timePeriods) {
          const predictionData = {
              ...originalData,
              days_left: parseInt(period.daysleft) // Update days_left for the prediction
          };

          // Fetch predicted fare for the updated scenario
          const predictionResponse = await axios.post("http://localhost:8000/fare/predict/", predictionData, {
              headers: {
                  "Content-Type": "application/json"
              }
          });

          // Create comparison record with predicted fare
          const comparisonRecord = {
              ...predictionData,
              fare: predictionResponse.data.predicted_fare
          };

          // Add the comparison record to the confirmations list
          allConfirmations.push(comparisonRecord);
      }

      // Update the state variables with the fetched data
      setConfirmations(allConfirmations);
      setFlightTable(originalData);
      setFlightPath([source_city, destination_city]);
      setPathVisible(true);
  } catch (error) {
      console.error("There is an error while predicting fare:", error);
      alert("There is an error occurred while predicting fare.");
  } finally {
      setLoading(false);
  }
};

  return (
    <Container>
      <Paper
        elevation={4}
        style={{ padding: "20px", marginTop: "20px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
          Flight Fare Prediction
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Airline */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={airline}
                getOptionLabel={(option) => `${option.name} (${option.iata})`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Airline"
                    variant="outlined"
                    InputLabelProps={{
                      style: { color: 'var(--primary-color)', fontWeight: 'bold' },
                    }}
                    className="custom-textfield" 
                    required
                  />
                )}
                onChange={(event, newValue) => setSelectedAirline(newValue ? newValue.iata : "")}
              />
            </Grid>

            {/* Stops */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth className="custom-textfield" required>
                <InputLabel sx={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Stops</InputLabel>
                <Select label="Stops" value={stops} onChange={(e) => setStops(e.target.value)}>
                  <MenuItem value="zero">Direct</MenuItem>
                  <MenuItem value="one">One Stop</MenuItem>
                  <MenuItem value="two_or_more">Two Or More Stops</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Source City */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={airports}
                getOptionLabel={(option) => `${option.city} - ${option.name} (${option.iata})`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Source City"
                    variant="outlined"
                    InputLabelProps={{
                      style: { color: 'var(--primary-color)', fontWeight: 'bold' },
                    }}
                    className="custom-textfield"
                    required
                  />
                )}
                onChange={(event, newValue) => setSourceCity(newValue ? newValue.iata : "")}
              />
            </Grid>

            {/* Destination City */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={airports}
                getOptionLabel={(option) => `${option.city} - ${option.name} (${option.iata})`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Destination City"
                    variant="outlined"
                    InputLabelProps={{
                      style: { color: 'var(--primary-color)', fontWeight: 'bold' },
                    }}
                    className="custom-textfield"
                    required
                  />
                )}
                onChange={(event, newValue) => setDestinationCity(newValue ? newValue.iata : "")}
              />
            </Grid>

            {/* Departure Time */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth className="custom-textfield" required>
                <InputLabel sx={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Departure Time</InputLabel>
                <Select label="Departure Time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)}>
                  <MenuItem value="Early_Morning">Early Morning (3:00 AM - 6:00 AM)</MenuItem>
                  <MenuItem value="Morning">Morning (6:00 AM - 12:00 PM)</MenuItem>
                  <MenuItem value="Afternoon">Afternoon (12:00 PM - 6:00 PM)</MenuItem>
                  <MenuItem value="Evening">Evening (6:00 PM - 9:00 PM)</MenuItem>
                  <MenuItem value="Night">Night (9:00 PM - 12:00 AM)</MenuItem>
                  <MenuItem value="Late_Night">Late Night (12:00 AM - 3:00 AM)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Arrival Time */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth className="custom-textfield" required>
                <InputLabel sx={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Arrival Time</InputLabel>
                <Select label="Arrival Time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)}>
                  <MenuItem value="Early_Morning">Early Morning (3:00 AM - 6:00 AM)</MenuItem>
                  <MenuItem value="Morning">Morning (6:00 AM - 12:00 PM)</MenuItem>
                  <MenuItem value="Afternoon">Afternoon (12:00 PM - 6:00 PM)</MenuItem>
                  <MenuItem value="Evening">Evening (6:00 PM - 9:00 PM)</MenuItem>
                  <MenuItem value="Night">Night (9:00 PM - 12:00 AM)</MenuItem>
                  <MenuItem value="Late_Night">Late Night (12:00 AM - 3:00 AM)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Departure Date */}
            <Grid item xs={12} md={6}>
              <TextField
                type="datetime-local"
                label="Departure Date"
                variant="outlined"
                fullWidth
                required
                InputLabelProps={{
                  style: { color: 'var(--primary-color)', fontWeight: 'bold' },
                  shrink: true
                }}
                className="custom-textfield"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
            </Grid>

            {/* Arrival Date */}
            <Grid item xs={12} md={6}>
              <TextField
                type="datetime-local"
                label="Arrival Date"
                variant="outlined"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                InputLabelProps={{
                  style: { color: 'var(--primary-color)', fontWeight: 'bold' },
                  shrink: true
                }}
                className="custom-textfield"
                required
                fullWidth
              />
            </Grid>

            {/* Flight Class */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth className="custom-textfield" required>
                <InputLabel sx={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Class</InputLabel>
                <Select label="Class" value={Class} onChange={(e) => setFlightClass(e.target.value)}>
                  <MenuItem value="Economy">Economy</MenuItem>
                  <MenuItem value="Business">Business</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Buy Ticket Date */}
            <Grid item xs={12} md={6}>
              <TextField
                type="datetime-local"
                label="Date You Buy Tickets"
                variant="outlined"
                value={buyTicketDate}
                onChange={(e) => setBuyTicketDate(e.target.value)}
                InputLabelProps={{
                  style: { color: 'var(--primary-color)', fontWeight: 'bold' },
                  shrink: true
                }}
                className="custom-textfield"
                required
                fullWidth
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    backgroundColor: 'var(--primary-color)',
                    fontWeight: 'bold',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'var(--hover-color)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Search"}
                </Button>
              </motion.div>
            </Grid>
          </Grid>
        </form>
        
        {/* Flight Path Visualization */}
        {pathVisible && flightPath.length === 2 && (
          <FlightPath flightPath={flightPath} />
        )}

        {/* Flight Details Table Visualization */}
        {confirmations.length > 0 && (
          <FlightTableForFare confirmations={confirmations} />
        )}
      </Paper>
    </Container>
  );
};

export default Fare;
