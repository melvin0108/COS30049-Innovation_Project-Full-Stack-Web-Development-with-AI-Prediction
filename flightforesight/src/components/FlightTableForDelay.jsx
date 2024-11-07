// src/components/FlightTableForDelay.jsx
import React from "react";
import Plot from "react-plotly.js";

// FlightTableForDelay component for displaying flight details in a table format
const FlightTableForDelay = ({ confirmations }) => { 
  // Helper function to transform confirmations data into Plotly table format
  const tableData = () => {
    // Return an empty array if confirmations data is missing or empty
    if (!confirmations || confirmations.length === 0) return []; 

    // Extract each flight detail field into arrays for table columns
    const months = confirmations.map(record => record.month);
    const days = confirmations.map(record => record.day);
    const daysofweeks = confirmations.map(record => record.daysofweek);
    const originAirports = confirmations.map(record => record.originAirport);
    const destinationAirports = confirmations.map(record => record.destinationAirport);
    const departureDelays = confirmations.map(record => record.departureDelay);
    const airTimes = confirmations.map(record => record.airTime.toFixed(0));
    const distances = confirmations.map(record => record.distance.toFixed(0));
    const arrivalDelays = confirmations.map(record => record.delay);
    const classifyDelays = confirmations.map(record => record.classification);

    return [
      {
        type: "table",
        header: {
          values: [
            "Month",
            "Day",
            "Day Of Week",
            "Origin Airport",
            "Destination Airport",
            "Departure Delay (minutes)",
            "Air Time (minutes)",
            "Distance (km)",
            "Arrival Delay (minutes)",
            "Delay Or Not?"
          ],
          align: "center", // Center-align header text
          line: { width: 1, color: 'black' }, // Header border color and width
          fill: { color: 'lightgrey' }, // Header background color
          font: { family: "Arial, sans-serif", size: 12, color: "black" },
        },
        cells: {
          values: [
            months,
            days,
            daysofweeks,
            originAirports,
            destinationAirports,  
            departureDelays,
            airTimes,
            distances,
            arrivalDelays,
            classifyDelays
          ],
          align: "center", // Center-align cell text
          line: { color: "black", width: 1 }, // Cell border color and width
          fill: { color: "white" }, // Background color for each cell
          font: { family: "Arial, sans-serif", size: 12, color: "black" }
        },
      },
    ];
  };

  return (
    <Plot
      data={tableData()} // Provide data formatted for Plotly table
      layout={{
        title: "Flight Delay Prediction Details", // Title displayed above the table
        height: 300, // Table height
        margin: { t: 40, l: 0, r: 0, b: 0, pad: 4 }, // Layout margins
      }}
      style={{ width: "100%", height: "400px" }} // Style for the table's width and height
    />
  );
};

export default FlightTableForDelay;
