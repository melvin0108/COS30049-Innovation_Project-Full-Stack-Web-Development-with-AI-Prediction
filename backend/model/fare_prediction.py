# backend/model/fare_prediction.py
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os
import logging
from sklearn.preprocessing import LabelEncoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from model.fare_prediction_db import FarePrediction, get_db
import math

# Initialize FastAPI app
app = FastAPI()

# CORS middleware to allow communication with frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model 
try:
    model_path = os.path.join("model", "rf_regressor.pkl")
    model = joblib.load(model_path)
except Exception as e:
    logging.error(f"Error loading model: {str(e)}")
    raise RuntimeError("Model file not found.")

# Request data model for flight fare prediction
class FlightFareRequest(BaseModel):
    airline: str
    sourceCity: str
    destinationCity: str
    departureTime: str
    arrivalTime: str
    stops: str
    flightClass: str
    duration: float
    days_left: int

def transform_features(data: FlightFareRequest):
    # This function transforms the input data into the feature set used during model training.
    # It applies label encoding to categorical variables as done during training.

    # Create a DataFrame from the input data
    input_df = pd.DataFrame({
        'airline': [data.airline],
        'source_city': [data.sourceCity],
        'departure_time': [data.departureTime],
        'stops': [data.stops],
        'arrival_time': [data.arrivalTime],
        'destination_city': [data.destinationCity],
        'class': [data.flightClass],
        'duration': [data.duration],
        'days_left': [data.days_left],
    })
    
    # Apply label encoding to categorical columns (same as done during training)
    label_columns = ['airline', 'source_city', 'departure_time', 'stops', 'arrival_time', 'destination_city', 'class']
    le = LabelEncoder()
    
    for column in label_columns:
        if input_df[column].dtype == 'object':
            input_df[column] = le.fit_transform(input_df[column])

    # Assign feature names to the transformed features
    feature_names = ['airline', 'source_city', 'departure_time', 'stops', 'arrival_time', 
                     'destination_city', 'class', 'duration', 'days_left']
    
    # Return the feature set as a DataFrame with feature names
    transformed_df = pd.DataFrame(input_df.values, columns=feature_names)
    
    return transformed_df

# Prediction endpoint
@app.post("/fare/predict/")
async def predict_flight_fare(flight_data: FlightFareRequest, db: Session = Depends(get_db)):
    try:
        # Transform input data into model features
        features = transform_features(flight_data)

        # Perform prediction using the loaded model
        predicted_fare = model.predict(features)

        # Store the features and prediction in the database
        flight_prediction = FarePrediction(
            airline=flight_data.airline,
            source_city=flight_data.sourceCity,
            destination_city=flight_data.destinationCity,
            departure_time=flight_data.departureTime,
            arrival_time=flight_data.arrivalTime,
            stops=flight_data.stops,
            flight_class=flight_data.flightClass,
            duration=float(math.ceil(flight_data.duration * 100)) / 100,
            days_left=flight_data.days_left,
            predicted_fare=round(predicted_fare[0], 2)
        )
        db.add(flight_prediction)
        db.commit()
        db.refresh(flight_prediction)

        # Return the predicted fare (rounded to 2 decimal places)
        return JSONResponse(content={"predicted_fare": round(predicted_fare[0], 2)})
    
    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Flight fare cannot be predicted.")

async def predict_and_store(flight_data: FlightFareRequest, days_left: int, db: Session):
    features = transform_features(flight_data)
    predicted_fare = model.predict(features)
    predicted_fare = round(predicted_fare[0], 2)

    return predicted_fare

# Define separate endpoints for each scenario with different "days_left" values
@app.post("/fare/predict/day_0/")
async def predict_fare_day_0(flight_data: FlightFareRequest, db: Session = Depends(get_db)):
    return {"predicted_fare": await predict_and_store(flight_data, days_left=0, db=db)}

@app.post("/fare/predict/day_1/")
async def predict_fare_day_1(flight_data: FlightFareRequest, db: Session = Depends(get_db)):
    return {"predicted_fare": await predict_and_store(flight_data, days_left=1, db=db)}

@app.post("/fare/predict/day_7/")
async def predict_fare_day_7(flight_data: FlightFareRequest, db: Session = Depends(get_db)):
    return {"predicted_fare": await predict_and_store(flight_data, days_left=7, db=db)}

@app.post("/fare/predict/day_14/")
async def predict_fare_day_14(flight_data: FlightFareRequest, db: Session = Depends(get_db)):
    return {"predicted_fare": await predict_and_store(flight_data, days_left=14, db=db)}

@app.post("/fare/predict/day_30/")
async def predict_fare_day_30(flight_data: FlightFareRequest, db: Session = Depends(get_db)):
    return {"predicted_fare": await predict_and_store(flight_data, days_left=30, db=db)}

# Root endpoint 
@app.get("/fare")
async def root():
    return {"message": "Flight Fare Prediction API is running"}

# Endpoint to get the prediction record stored in the database
@app.get("/fare/predictions/")
async def get_predictions(db: Session = Depends(get_db)):
    predictions = db.query(FarePrediction).all()
    return predictions

# Main execution
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
