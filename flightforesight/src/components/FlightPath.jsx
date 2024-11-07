// src/components/FlightPath.jsx
import React from 'react';
import Plot from 'react-plotly.js';

// FlightPath component for visualizing the flight path on a world map
const FlightPath = ({ flightPath }) => {
  // Helper function to transform flightPath data into Plotly format
  const plotData = () => {
    // Return an empty array if flightPath has fewer than 2 points
    if (flightPath.length < 2) return [];

    // Extract latitude, longitude, and airport details for each airport in the flight path
    const latitudes = flightPath.map((airport) => airport.latitude);
    const longitudes = flightPath.map((airport) => airport.longitude);
    const airportDetails = flightPath.map(
      (airport) => `${airport.name} (${airport.iata}), ${airport.city}`
    );

    // Return data in the format Plotly expects for a scatter geo plot
    return [
      {
        type: "scattergeo", // Specifies the plot type as a geographical scatter plot
        mode: "lines+markers", // Lines for the flight path and markers for the airports
        lat: latitudes, // Array of latitude coordinates
        lon: longitudes, // Array of longitude coordinates
        marker: {
          size: 8, // Marker size
          color: "red", // Marker color
        },
        line: {
          width: 2, // Line width
          color: "red", // Line color
        },
        text: airportDetails, // Details shown on hover for each marker
        hoverinfo: "text", // Hover only displays text (airport details)
      },
    ];
  };

  return (
    <Plot
      // Pass data from plotData to Plotly for rendering
      data={plotData()}
      layout={{
        title: "Flight Path", // Chart title
        geo: {
          scope: "world", // Specifies global view
          showcoastlines: true, // Display coastlines
          coastlinecolor: "RebeccaPurple", // Color for coastlines
          showland: true, // Display land areas
          landcolor: "lightgreen", // Land color
          showocean: true, // Display ocean areas
          oceancolor: "lightblue", // Ocean color
          showlakes: true, // Display lakes
          lakecolor: "blue", // Lake color
          showrivers: true, // Display rivers
          rivercolor: "blue", // River color
          showcountries: true, // Display country borders
          countrycolor: "rebeccapurple", // Country border color
          projection: {
            type: "natural earth", // Use the natural earth projection
          },
        },
        // Layout adjustments
        margin: { t: 40, l: 0, r: 0, b: 0 },
      }}
      style={{ width: "100%", height: "400px" }} // Style for the plot's width and height
    />
  );
};

export default FlightPath;
