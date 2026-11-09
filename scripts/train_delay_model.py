import pandas as pd
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


# 1. PROJECT PATHS

project_path = Path(__file__).resolve().parents[1]

data_path = project_path / "processed" / "cleaned_delivery_data.csv"

model_path = project_path / "models" / "delivery_delay_model.pkl"


# 2. LOAD DATASET

print("\nLOADING DELIVERY DATASET")

df = pd.read_csv(data_path)

print("Dataset Shape:", df.shape)


# 3. CREATE RISK CATEGORIES

def classify_delivery_risk(minutes):

    if minutes <= 20:
        return "Low"

    elif minutes <= 30:
        return "Medium"

    else:
        return "High"


df["Delay_Risk"] = df["Time_taken (min)"].apply(
    classify_delivery_risk
)

print("\nRisk Category Distribution:")
print(df["Delay_Risk"].value_counts())


# 4. SELECT FEATURES AND TARGET

X = df.drop(
    columns=["Time_taken (min)", "Delay_Risk"]
)

y = df["Delay_Risk"]


# 5. IDENTIFY FEATURE TYPES

numerical_features = X.select_dtypes(
    include=["int64", "float64"]
).columns.tolist()

categorical_features = X.select_dtypes(
    include=["object", "str", "bool", "string"]
).columns.tolist()


print("\nNumerical Features:")
print(numerical_features)

print("\nCategorical Features:")
print(categorical_features)


# 6. SPLIT DATASET

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining Records:", len(X_train))
print("Testing Records:", len(X_test))


# 7. PREPROCESSING

numerical_transformer = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ]
)

categorical_transformer = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore"))
    ]
)

preprocessor = ColumnTransformer(
    transformers=[
        ("num", numerical_transformer, numerical_features),
        ("cat", categorical_transformer, categorical_features)
    ]
)


# 8. RANDOM FOREST CLASSIFIER

classifier = RandomForestClassifier(
    n_estimators=200,
    max_depth=18,
    min_samples_leaf=2,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)


delay_model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("classifier", classifier)
    ]
)


# 9. TRAIN MODEL

print("\nTRAINING DELAY CLASSIFICATION MODEL")

delay_model.fit(X_train, y_train)

print("Training Completed Successfully!")


# 10. PREDICTIONS

y_pred = delay_model.predict(X_test)


# 11. MODEL EVALUATION

accuracy = accuracy_score(y_test, y_pred)

print("\nMODEL ACCURACY:")
print(round(accuracy * 100, 2), "%")

print("\nCLASSIFICATION REPORT:")

print(
    classification_report(
        y_test,
        y_pred,
        labels=["Low", "Medium", "High"],
        zero_division=0
    )
)

print("\nCONFUSION MATRIX:")

print(
    confusion_matrix(
        y_test,
        y_pred,
        labels=["Low", "Medium", "High"]
    )
)


# 12. SAVE MODEL

model_path.parent.mkdir(
    parents=True,
    exist_ok=True
)

joblib.dump(delay_model, model_path)

print("\nMODEL SAVED SUCCESSFULLY!")

print("Location:", model_path)

print("\nDELIVERYAI DELAY MODEL COMPLETED!")