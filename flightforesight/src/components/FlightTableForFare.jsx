// src/components/FlightTableForFare.jsx
import React from "react";
import Plot from "react-plotly.js";

// FlightTableForFare component for displaying flight details in a table format
const FlightTableForFare = ({ confirmations }) => {
  // Helper function to transform confirmations data into Plotly table format
  const tableData = () => {
    // Return an empty array if confirmations data is missing or empty
    if (!confirmations || confirmations.length === 0) return []; 

    // Extract each flight detail field into arrays for table columns
    const airlines = confirmations.map(record => record.airline);
    const flightClasses = confirmations.map(record => record.flightClass);
    const stops = confirmations.map(record => record.stops);
    const sourceCities = confirmations.map(record => record.sourceCity);
    const destinationCities = confirmations.map(record => record.destinationCity);
    const departureTimes = confirmations.map(record => record.departureTime);
    const arrivalTimes = confirmations.map(record => record.arrivalTime);
    const durations = confirmations.map(record => record.duration.toFixed(2));
    const days_lefts = confirmations.map(record => record.days_left);
    const fares = confirmations.map(record => record.fare);

    // Row color styling: 'lightgreen' for original data, 'white' for other rows
    const rowColors = confirmations.map(record => 
      record.isOriginal ? 'lightgreen' : 'white'
    );

    // Apply row colors to each column by creating a nested array for cell colors
    const cellColors = [
      rowColors, rowColors, rowColors, rowColors, rowColors,
      rowColors, rowColors, rowColors, rowColors, rowColors
    ];

    return [
      {
        type: "table",
        header: {
          values: [
            "Airline",
            "Class",
            "Stops",
            "Source City",
            "Destination City",
            "Departure Time",
            "Arrival Time",
            "Duration (hours)",
            "Days Left Before Departure",
            "Price (AUD)"
          ],
          align: "center", // Center-align header text
          line: { width: 1, color: 'black' }, // Header border color and width
          fill: { color: 'lightgrey' }, // Header background color
          font: { family: "Arial, sans-serif", size: 12, color: "black", weight: "bold" },
        },
        cells: {
          values: [
            airlines,
            flightClasses,
            stops,
            sourceCities,
            destinationCities,
            departureTimes,
            arrivalTimes,
            durations,
            days_lefts,
            fares
          ],
          align: "center", // Center-align cell text
          line: { color: "black", width: 1 }, // Cell border color and width
          fill: { color: cellColors }, // Background color for each cell based on rowColors
          font: { family: "Arial, sans-serif", size: 12, color: "black" },
        },
      },
    ];
  };

  return (
    <Plot
      data={tableData()} // Provide data formatted for Plotly table
      layout={{
        title: "Flight Fare Prediction Details", // Title displayed above the table
        height: 300, // Table height
        margin: { t: 40, l: 0, r: 0, b: 0, pad: 4 }, // Layout margins
      }}
      style={{ width: "100%", height: "400px" }} // Style for the table's width and height
    />
  );
};

export default FlightTableForFare;
