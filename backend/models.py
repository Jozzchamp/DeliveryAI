from sqlalchemy import Column, Integer, Float, String, DateTime, JSON
from sqlalchemy.sql import func

from .database import Base


class Prediction(Base):

    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    # Delivery information
    delivery_distance = Column(Float, nullable=False)
    weather_conditions = Column(String(50))
    traffic_conditions = Column(String(50))

    # AI prediction results
    predicted_eta = Column(Float, nullable=False)
    predicted_delay_risk = Column(String(20))

    # Risk probabilities
    risk_probabilities = Column(JSON)

    # SHAP explanation
    baseline_eta = Column(Float)
    explanations = Column(JSON)

    # Original input features
    input_features = Column(JSON)

    # Prediction timestamp
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


class DeliveryPartner(Base):

    __tablename__ = "delivery_partners"

    # Unique partner ID
    id = Column(Integer, primary_key=True, index=True)

    # Partner information
    partner_code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    vehicle_type = Column(String(50), nullable=False)

    # Performance information
    rating = Column(Float, default=0.0)
    total_deliveries = Column(Integer, default=0)
    average_delivery_time = Column(Float, nullable=True)

    # Partner availability
    status = Column(String(20), default="Active", nullable=False)

    # Registration timestamp
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

