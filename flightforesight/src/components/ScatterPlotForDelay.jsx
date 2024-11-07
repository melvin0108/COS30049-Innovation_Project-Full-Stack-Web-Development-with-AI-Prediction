// src/components/ScatterPlotForDelay.jsx
import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import axios from "axios"; 

// ScatterPlotForDelay component for displaying predicted delay vs distance in a scatter plot
const ScatterPlotForDelay = () => { 
  const [predictions, setPredictions] = useState([]); 

  // Fetch delay predictions when the component mounts from API endpoint
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        // Send data to stored predictions endpoint
        const response = await axios.get("http://localhost:8000/delay/predictions"); 
        setPredictions(response.data); 
      } catch (error) {
        console.error("Error fetching predictions:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchPredictions();
  }, []); 

  // Prepare data for the scatter plot
  const scatterData = () => {
    if (!predictions || predictions.length === 0) return []; 

    const xValues = predictions.map(prediction => prediction.distance); // X-axis data
    const yValues = predictions.map(prediction => prediction.predicted_delay); // Y-axis data

    return [{
      x: xValues, // Distance values for the X-axis
      y: yValues, // Predicted delay values for the Y-axis
      mode: 'markers', // Markers for the data points
      type: 'scatter', // Specifies the plot type as a scatter plot
      marker: { size: 10, color: 'lightgreen' }, // Size and color of the markers
    }];
  };

  return (
    <Plot
      data={scatterData()} // Provide data formatted for Plotly scatter plot
      layout={{
        title: "Predicted Delay vs Distance", // Title displayed above the table
        xaxis: { title: 'Distance (km)' }, // Label for the X-axis
        yaxis: { title: 'Predicted Delay (minutes)' }, // Label for the Y-axis
        height: 400, // Scatter plot height
        margin: { t: 40, l: 40, r: 40, b: 40, pad: 4 }, // Layout margins
      }}
      style={{ width: "100%", height: "400px" }} // Style for the table's width and height
    />
  );
};

export default ScatterPlotForDelay;
