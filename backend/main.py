from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path

import pandas as pd
import numpy as np
import joblib
import shap

from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend.models import Prediction, DeliveryPartner


# ==========================================
# 1. LOAD MACHINE LEARNING MODELS
# ==========================================

project_path = Path(__file__).resolve().parents[1]

eta_model_path = project_path / "models" / "delivery_eta_model.pkl"
delay_model_path = project_path / "models" / "delivery_delay_model.pkl"

eta_model = joblib.load(eta_model_path)
delay_model = joblib.load(delay_model_path)

print("ETA Prediction Model Loaded Successfully!")
print("Delay Classification Model Loaded Successfully!")


# ==========================================
# 2. INPUT DATA STRUCTURE
# ==========================================

class DeliveryInput(BaseModel):
    Delivery_person_Age: float
    Delivery_person_Ratings: float
    Delivery_Distance_km: float
    Vehicle_condition: int
    multiple_deliveries: int
    Order_Hour: int
    Order_Month: int
    Weather_conditions: str
    Road_traffic_density: str
    Type_of_order: str
    Type_of_vehicle: str
    Festival: str
    City: str
    Is_Weekend: bool

    # DELIVERY PARTNER SCHEMAS

class DeliveryPartnerCreate(BaseModel):
    partner_code: str
    name: str
    vehicle_type: str
    rating: float = 0.0
    total_deliveries: int = 0
    average_delivery_time: float | None = None
    status: str = "Active"


class DeliveryPartnerUpdate(BaseModel):
    partner_code: str | None = None
    name: str | None = None
    vehicle_type: str | None = None
    rating: float | None = None
    total_deliveries: int | None = None
    average_delivery_time: float | None = None
    status: str | None = None


# ==========================================
# 3. FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="DeliveryAI API",
    description="AI-powered Food Delivery ETA, Delay Prediction and Explainable AI System",
    version="4.0.0"
)


# ==========================================
# 4. CORS CONFIGURATION
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# 5. HOME API
# ==========================================

@app.get("/")
def home():
    return {
        "message": "Welcome to DeliveryAI Backend!",
        "status": "Running"
    }


# ==========================================
# 6. HEALTH CHECK API
# ==========================================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": "DeliveryAI",
        "models": {
            "eta_prediction": "loaded",
            "delay_classification": "loaded",
            "shap_explainability": "available"
        },
        "database": "connected"
    }


# ==========================================
# 7. ETA PREDICTION API
# ==========================================

@app.post("/api/predict")
def predict_delivery(data: DeliveryInput):

    input_data = pd.DataFrame([data.model_dump()])

    prediction = eta_model.predict(input_data)

    predicted_time = round(float(prediction[0]), 2)

    return {
        "status": "success",
        "predicted_delivery_time_minutes": predicted_time,
        "message": f"Estimated delivery time is {predicted_time} minutes"
    }


# ==========================================
# 8. DELAY CLASSIFICATION API
# ==========================================

@app.post("/api/predict-delay")
def predict_delay(data: DeliveryInput):

    input_data = pd.DataFrame([data.model_dump()])

    prediction = delay_model.predict(input_data)

    probabilities = delay_model.predict_proba(input_data)[0]

    classifier = delay_model.named_steps["classifier"]

    risk_probabilities = {
        risk: round(float(probability) * 100, 2)
        for risk, probability in zip(
            classifier.classes_,
            probabilities
        )
    }

    predicted_risk = str(prediction[0])

    return {
        "status": "success",
        "predicted_delay_risk": predicted_risk,
        "risk_probabilities": risk_probabilities,
        "message": f"Predicted delivery duration category: {predicted_risk}"
    }


# ==========================================
# 9. SHAP EXPLAINABLE AI API
# ==========================================

@app.post("/api/explain")
def explain_prediction(data: DeliveryInput):

    input_data = pd.DataFrame([data.model_dump()])

    preprocessor = eta_model.named_steps["preprocessor"]

    regressor = eta_model.named_steps["model"]

    transformed_data = preprocessor.transform(input_data)

    feature_names = preprocessor.get_feature_names_out()

    transformed_df = pd.DataFrame(
        transformed_data,
        columns=feature_names
    )

    explainer = shap.TreeExplainer(regressor)

    shap_values = explainer.shap_values(transformed_df)

    contributions = np.array(shap_values)[0]

    base_value = float(
        np.array(explainer.expected_value).flatten()[0]
    )

    predicted_time = float(eta_model.predict(input_data)[0])

    explanations = []

    for feature, contribution in zip(feature_names, contributions):

        clean_feature = (
            feature
            .replace("num__", "")
            .replace("cat__", "")
        )

        contribution = float(contribution)

        explanations.append({
            "feature": clean_feature,
            "impact_minutes": round(contribution, 3),
            "direction": (
                "increases"
                if contribution > 0
                else "decreases"
                if contribution < 0
                else "no impact"
            )
        })

    explanations.sort(
        key=lambda item: abs(item["impact_minutes"]),
        reverse=True
    )

    top_explanations = explanations[:10]

    # ======================================
    # 10. GET DELAY PREDICTION
    # ======================================

    delay_prediction = delay_model.predict(input_data)

    probabilities = delay_model.predict_proba(input_data)[0]

    classifier = delay_model.named_steps["classifier"]

    risk_probabilities = {
        risk: round(float(probability) * 100, 2)
        for risk, probability in zip(
            classifier.classes_,
            probabilities
        )
    }

    predicted_risk = str(delay_prediction[0])

    # ======================================
    # 11. SAVE PREDICTION TO POSTGRESQL
    # ======================================

    db: Session = SessionLocal()

    try:

        new_prediction = Prediction(

            delivery_distance=float(data.Delivery_Distance_km),

            weather_conditions=data.Weather_conditions,

            traffic_conditions=data.Road_traffic_density,

            predicted_eta=round(predicted_time, 2),

            predicted_delay_risk=predicted_risk,

            risk_probabilities=risk_probabilities,

            baseline_eta=round(base_value, 2),

            explanations=top_explanations,

            input_features=data.model_dump()

        )

        db.add(new_prediction)

        db.commit()

        db.refresh(new_prediction)

        saved_prediction_id = new_prediction.id

    except Exception as error:

        db.rollback()

        print("DATABASE SAVE ERROR:", str(error))

        raise HTTPException(
            status_code=500,
            detail="Prediction generated but database saving failed."
        )

    finally:

        db.close()

    # ======================================
    # 12. RETURN COMPLETE RESPONSE
    # ======================================

    return {

        "status": "success",

        "prediction_id": saved_prediction_id,

        "database_saved": True,

        "predicted_delivery_time_minutes": round(predicted_time, 2),

        "predicted_delay_risk": predicted_risk,

        "risk_probabilities": risk_probabilities,

        "baseline_delivery_time_minutes": round(base_value, 2),

        "explanations": top_explanations,

        "message": "Prediction generated and saved successfully!"

    }


# ==========================================
# END OF DELIVERYAI BACKEND
# ==========================================

# ==========================================
# 13. GET PREDICTION HISTORY API
# ==========================================

@app.get("/api/predictions")
def get_predictions():

    db = SessionLocal()

    try:
        predictions = (
            db.query(Prediction)
            .order_by(Prediction.created_at.desc())
            .all()
        )

        result = []

        for prediction in predictions:

            result.append({
                "id": prediction.id,
                "delivery_distance": prediction.delivery_distance,
                "weather_conditions": prediction.weather_conditions,
                "traffic_conditions": prediction.traffic_conditions,
                "predicted_eta": prediction.predicted_eta,
                "predicted_delay_risk": prediction.predicted_delay_risk,
                "risk_probabilities": prediction.risk_probabilities,
                "baseline_eta": prediction.baseline_eta,
                "explanations": prediction.explanations,
                "input_features": prediction.input_features,
                "created_at": (
                    prediction.created_at.isoformat()
                    if prediction.created_at else None
                )
            })

        return {
            "status": "success",
            "total_predictions": len(result),
            "predictions": result
        }

    except Exception as error:

        print("DATABASE FETCH ERROR:", str(error))

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve prediction history."
        )

    finally:
        db.close()

        # ==========================================
# 14. DELIVERY PARTNER MANAGEMENT APIs
# ==========================================


# 1. GET ALL DELIVERY PARTNERS
@app.get("/api/delivery-partners")
def get_delivery_partners():

    db = SessionLocal()

    try:
        partners = (
            db.query(DeliveryPartner)
            .order_by(DeliveryPartner.id.desc())
            .all()
        )

        return {
            "status": "success",
            "total_partners": len(partners),
            "partners": [
                {
                    "id": p.id,
                    "partner_code": p.partner_code,
                    "name": p.name,
                    "vehicle_type": p.vehicle_type,
                    "rating": p.rating,
                    "total_deliveries": p.total_deliveries,
                    "average_delivery_time": p.average_delivery_time,
                    "status": p.status
                }
                for p in partners
            ]
        }

    finally:
        db.close()


# 2. ADD NEW DELIVERY PARTNER
@app.post("/api/delivery-partners")
def add_delivery_partner(data: DeliveryPartnerCreate):

    db = SessionLocal()

    try:
        existing = db.query(DeliveryPartner).filter(
            DeliveryPartner.partner_code == data.partner_code
        ).first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Partner code already exists."
            )

        new_partner = DeliveryPartner(**data.model_dump())

        db.add(new_partner)
        db.commit()
        db.refresh(new_partner)

        return {
            "status": "success",
            "message": "Delivery partner added successfully!",
            "partner_id": new_partner.id
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# 3. UPDATE DELIVERY PARTNER
@app.put("/api/delivery-partners/{partner_id}")
def update_delivery_partner(
    partner_id: int,
    data: DeliveryPartnerUpdate
):

    db = SessionLocal()

    try:
        partner = db.query(DeliveryPartner).filter(
            DeliveryPartner.id == partner_id
        ).first()

        if not partner:
            raise HTTPException(
                status_code=404,
                detail="Delivery partner not found."
            )

        updates = data.model_dump(exclude_unset=True)

        if "partner_code" in updates:
            duplicate = db.query(DeliveryPartner).filter(
                DeliveryPartner.partner_code == updates["partner_code"],
                DeliveryPartner.id != partner_id
            ).first()

            if duplicate:
                raise HTTPException(
                    status_code=409,
                    detail="Partner code already exists."
                )

        for key, value in updates.items():
            setattr(partner, key, value)

        db.commit()

        return {
            "status": "success",
            "message": "Delivery partner updated successfully!"
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# 4. DELETE DELIVERY PARTNER
@app.delete("/api/delivery-partners/{partner_id}")
def delete_delivery_partner(partner_id: int):

    db = SessionLocal()

    try:
        partner = db.query(DeliveryPartner).filter(
            DeliveryPartner.id == partner_id
        ).first()

        if not partner:
            raise HTTPException(
                status_code=404,
                detail="Delivery partner not found."
            )

        db.delete(partner)
        db.commit()

        return {
            "status": "success",
            "message": "Delivery partner deleted successfully!"
        }

    finally:
        db.close()