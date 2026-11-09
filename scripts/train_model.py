import pandas as pd
import numpy as np
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split, cross_validate
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor

from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor,
    ExtraTreesRegressor
)


print("=" * 60)
print("DELIVERYAI - ADVANCED MODEL TRAINING")
print("=" * 60)


# --------------------------------------------------
# 1. PROJECT PATH AND DATASET
# --------------------------------------------------

project_path = Path(__file__).resolve().parents[1]

dataset_path = (
    project_path / "processed" / "cleaned_delivery_data.csv"
)

df = pd.read_csv(dataset_path)

print("\nDataset Loaded Successfully!")
print("Dataset Shape:", df.shape)


# --------------------------------------------------
# 2. DATA PREPARATION
# --------------------------------------------------

target_column = "Time_taken (min)"

if target_column not in df.columns:
    raise ValueError(f"Target column missing: {target_column}")

df = df.dropna(subset=[target_column])

X = df.drop(columns=[target_column])
y = df[target_column]

print("\nInput Features:", X.shape)
print("Target Values:", y.shape)


# --------------------------------------------------
# 3. TRAIN TEST SPLIT
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("\nTraining Records:", len(X_train))
print("Testing Records:", len(X_test))


# --------------------------------------------------
# 4. FEATURE IDENTIFICATION
# --------------------------------------------------

numerical_features = X.select_dtypes(
    include=["number"]
).columns.tolist()

categorical_features = X.select_dtypes(
    include=["object", "category", "bool", "string"]
).columns.tolist()

print("\nNumerical Features:")
print(numerical_features)

print("\nCategorical Features:")
print(categorical_features)


# --------------------------------------------------
# 5. PREPROCESSING FUNCTION
# --------------------------------------------------

def create_preprocessor():

    numerical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore"))
    ])

    preprocessor = ColumnTransformer(transformers=[
        ("num", numerical_transformer, numerical_features),
        ("cat", categorical_transformer, categorical_features)
    ])

    return preprocessor


# --------------------------------------------------
# 6. DEFINE MACHINE LEARNING MODELS
# --------------------------------------------------

models = {

    "Linear Regression": LinearRegression(),

    "Decision Tree": DecisionTreeRegressor(
        max_depth=12,
        random_state=42
    ),

    "Random Forest": RandomForestRegressor(
        n_estimators=100,
        max_depth=15,
        random_state=42,
        n_jobs=-1
    ),

    "Gradient Boosting": GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=3,
        random_state=42
    ),

    "Extra Trees": ExtraTreesRegressor(
        n_estimators=100,
        max_depth=15,
        random_state=42,
        n_jobs=-1
    )
}


# --------------------------------------------------
# 7. TRAIN AND EVALUATE MODELS
# --------------------------------------------------

results = []

trained_models = {}

print("\n" + "=" * 60)
print("MODEL TRAINING AND EVALUATION")
print("=" * 60)


for model_name, regressor in models.items():

    print(f"\nTraining {model_name}...")

    pipeline = Pipeline(steps=[
        ("preprocessor", create_preprocessor()),
        ("model", regressor)
    ])

    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)

    mae = mean_absolute_error(y_test, predictions)

    rmse = np.sqrt(
        mean_squared_error(y_test, predictions)
    )

    r2 = r2_score(y_test, predictions)

    results.append({
        "Model": model_name,
        "MAE": mae,
        "RMSE": rmse,
        "R2 Score": r2
    })

    trained_models[model_name] = pipeline

    print(f"{model_name} completed!")
    print("MAE:", round(mae, 2))
    print("RMSE:", round(rmse, 2))
    print("R2 Score:", round(r2, 4))


# --------------------------------------------------
# 8. MODEL COMPARISON
# --------------------------------------------------

results_df = pd.DataFrame(results)

results_df = results_df.sort_values(
    by="MAE",
    ascending=True
).reset_index(drop=True)

print("\n" + "=" * 60)
print("MODEL PERFORMANCE COMPARISON")
print("=" * 60)

print(results_df.round(4).to_string(index=False))


# --------------------------------------------------
# 9. SELECT BEST MODEL
# --------------------------------------------------

best_model_name = results_df.iloc[0]["Model"]

best_model = trained_models[best_model_name]

print("\nBest Model Based on Test MAE:", best_model_name)


# --------------------------------------------------
# 10. CROSS VALIDATION
# --------------------------------------------------

print("\n" + "=" * 60)
print("5-FOLD CROSS VALIDATION")
print("=" * 60)

cv_results = cross_validate(
    best_model,
    X_train,
    y_train,
    cv=5,
    scoring={
        "MAE": "neg_mean_absolute_error",
        "RMSE": "neg_root_mean_squared_error",
        "R2": "r2"
    },
    n_jobs=-1
)

cv_mae = -cv_results["test_MAE"]
cv_rmse = -cv_results["test_RMSE"]
cv_r2 = cv_results["test_R2"]

print("\nCross Validation Results:")

print("Average MAE:", round(cv_mae.mean(), 2))
print("MAE Standard Deviation:", round(cv_mae.std(), 2))

print("Average RMSE:", round(cv_rmse.mean(), 2))
print("Average R2 Score:", round(cv_r2.mean(), 4))


# --------------------------------------------------
# 11. SAVE MODEL
# --------------------------------------------------

model_path = (
    project_path / "models" / "delivery_eta_model.pkl"
)

model_path.parent.mkdir(
    parents=True,
    exist_ok=True
)

joblib.dump(best_model, model_path)

print("\nBest Model Saved Successfully!")
print("Model:", best_model_name)
print("Location:", model_path)


# --------------------------------------------------
# 12. SAVE EVALUATION REPORT
# --------------------------------------------------

evaluation_path = (
    project_path / "processed" / "model_evaluation.csv"
)

results_df.to_csv(
    evaluation_path,
    index=False
)

print("\nModel Evaluation Report Saved!")
print("Location:", evaluation_path)


# --------------------------------------------------
# 13. FINAL SUMMARY
# --------------------------------------------------

print("\n" + "=" * 60)
print("DELIVERYAI TRAINING COMPLETED SUCCESSFULLY!")
print("=" * 60)

print("Selected Model:", best_model_name)

print("Test MAE:", round(results_df.iloc[0]["MAE"], 2))

print("Cross Validation MAE:", round(cv_mae.mean(), 2))

print("Test R2:", round(results_df.iloc[0]["R2 Score"], 4))

print("\nYour ETA model is ready!")

