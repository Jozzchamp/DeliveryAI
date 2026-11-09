import joblib
import pandas as pd

from pathlib import Path

# Locate project folder

project_path = Path(__file__).resolve().parents[1]

# Load saved model

model_path = project_path / "models" / "delivery_eta_model.pkl"

model = joblib.load(model_path)

print("DeliveryAI Model Loaded Successfully!")

# Create sample delivery details

sample_data = pd.DataFrame([{
    "Delivery_person_Age": 25,
    "Delivery_person_Ratings": 4.5,
    "Delivery_Distance_km": 8.5,
    "Vehicle_condition": 2,
    "multiple_deliveries": 1,
    "Order_Hour": 13,
    "Order_Month": 11,
    "Weather_conditions": "Sunny",
    "Road_traffic_density": "Low",
    "Type_of_order": "Snack",
    "Type_of_vehicle": "motorcycle",
    "Festival": "No",
    "City": "Metropolitian",
    "Is_Weekend": False
}])

# Predict delivery time

prediction = model.predict(sample_data)

print("\nDELIVERY ETA PREDICTION")
print("-" * 35)

print("Predicted Delivery Time:", round(prediction[0], 2), "minutes")