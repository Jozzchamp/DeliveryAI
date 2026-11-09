import pandas as pd
import numpy as np
import shap
import joblib

from pathlib import Path

# Project paths
project_path = Path(__file__).resolve().parents[1]

model_path = project_path / "models" / "delivery_eta_model.pkl"
data_path = project_path / "processed" / "cleaned_delivery_data.csv"

# Load trained model and dataset
print("Loading ETA model...")

model = joblib.load(model_path)

print("Loading dataset...")

df = pd.read_csv(data_path)

# Separate preprocessing and trained model
preprocessor = model.named_steps["preprocessor"]
regressor = model.named_steps["model"]

# Select input features
X = df.drop(columns=["Time_taken (min)"])

# Use a sample of data for SHAP analysis
X_sample = X.sample(n=100, random_state=42)

print("\nPreparing data for SHAP...")

# Transform data using the existing preprocessing pipeline
X_transformed = preprocessor.transform(X_sample)

# Get transformed feature names
feature_names = preprocessor.get_feature_names_out()

# Convert transformed data into a DataFrame
X_transformed_df = pd.DataFrame(
    X_transformed,
    columns=feature_names
)

# Create SHAP Tree Explainer
print("\nCreating SHAP explainer...")

explainer = shap.TreeExplainer(regressor)

# Calculate SHAP values
print("Calculating SHAP values...")

shap_values = explainer.shap_values(X_transformed_df)

# Calculate average absolute SHAP importance
importance = np.abs(shap_values).mean(axis=0)

# Create feature importance table
importance_df = pd.DataFrame({
    "Feature": feature_names,
    "SHAP_Importance": importance
})

# Sort features by importance
importance_df = importance_df.sort_values(
    by="SHAP_Importance",
    ascending=False
)

print("\n========== SHAP FEATURE IMPORTANCE ==========\n")

print(importance_df.head(20).to_string(index=False))

# Save feature importance
output_path = project_path / "processed" / "shap_feature_importance.csv"

importance_df.to_csv(output_path, index=False)

print("\nSHAP analysis completed successfully!")

print(f"Feature importance saved at: {output_path}")

# Generate SHAP summary plot
print("\nGenerating SHAP summary plot...")

shap.summary_plot(
    shap_values,
    X_transformed_df,
    max_display=15,
    show=False
)

import matplotlib.pyplot as plt

plt.tight_layout()

plot_path = project_path / "processed" / "shap_summary.png"

plt.savefig(plot_path, dpi=300, bbox_inches="tight")

plt.close()

print(f"SHAP summary plot saved at: {plot_path}")