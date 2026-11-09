import pandas as pd
import numpy as np

# Load original dataset
file_path = "dataset/Zomato Dataset.csv"
df = pd.read_csv(file_path)

print("DELIVERYAI DATA CLEANING STARTED!")
print("-" * 50)

print("Original Dataset Shape:", df.shape)

print("\nMissing Values:")
print(df.isnull().sum())

print("\nDuplicate Records:")
print(df.duplicated().sum())

print("\nCOORDINATE INVESTIGATION")
print("-" * 50)

# Count negative restaurant coordinates
print(
    "Negative Restaurant Latitude:",
    (df["Restaurant_latitude"] < 0).sum()
)

print(
    "Negative Restaurant Longitude:",
    (df["Restaurant_longitude"] < 0).sum()
)

# Display suspicious records
suspicious = df[
    (df["Restaurant_latitude"] < 0) |
    (df["Restaurant_longitude"] < 0)
]

print("\nSuspicious Coordinate Records:")
print(
    suspicious[
        [
            "Restaurant_latitude",
            "Restaurant_longitude",
            "Delivery_location_latitude",
            "Delivery_location_longitude",
            "City"
        ]
    ].head(10).to_string(index=False)
)

print("\nTotal Suspicious Records:", len(suspicious))

print("\nCOORDINATE CORRECTION TEST")
print("-" * 50)

# Create a separate copy
df_test = df.copy()

# Correct negative restaurant coordinates
df_test["Restaurant_latitude"] = (
    df_test["Restaurant_latitude"].abs()
)

df_test["Restaurant_longitude"] = (
    df_test["Restaurant_longitude"].abs()
)

print("Original dataset shape:", df.shape)
print("Test dataset shape:", df_test.shape)

print("\nNegative latitude after correction:")
print((df_test["Restaurant_latitude"] < 0).sum())

print("\nNegative longitude after correction:")
print((df_test["Restaurant_longitude"] < 0).sum())

print("\nINDIA COORDINATE VALIDATION")
print("-" * 50)

# Check restaurant coordinates
invalid_restaurants = df_test[
    (df_test["Restaurant_latitude"] < 8) |
    (df_test["Restaurant_latitude"] > 37) |
    (df_test["Restaurant_longitude"] < 68) |
    (df_test["Restaurant_longitude"] > 97)
]

# Check delivery coordinates
invalid_deliveries = df_test[
    (df_test["Delivery_location_latitude"] < 8) |
    (df_test["Delivery_location_latitude"] > 37) |
    (df_test["Delivery_location_longitude"] < 68) |
    (df_test["Delivery_location_longitude"] > 97)
]

print("Restaurants outside India bounds:", len(invalid_restaurants))
print("Delivery locations outside India bounds:", len(invalid_deliveries))

print("\nDETAILED COORDINATE INVESTIGATION")
print("-" * 50)

print("Restaurant Latitude Range:")
print(df_test["Restaurant_latitude"].min(),
      "to",
      df_test["Restaurant_latitude"].max())

print("\nRestaurant Longitude Range:")
print(df_test["Restaurant_longitude"].min(),
      "to",
      df_test["Restaurant_longitude"].max())

print("\nDelivery Latitude Range:")
print(df_test["Delivery_location_latitude"].min(),
      "to",
      df_test["Delivery_location_latitude"].max())

print("\nDelivery Longitude Range:")
print(df_test["Delivery_location_longitude"].min(),
      "to",
      df_test["Delivery_location_longitude"].max())

print("\nFirst 15 Records Outside India Bounds:")

print(
    invalid_restaurants[
        [
            "Restaurant_latitude",
            "Restaurant_longitude",
            "Delivery_location_latitude",
            "Delivery_location_longitude",
            "City"
        ]
    ].head(15).to_string(index=False)
)

print("\nZERO COORDINATE INVESTIGATION")
print("-" * 50)

zero_restaurants = df_test[
    (df_test["Restaurant_latitude"] == 0) |
    (df_test["Restaurant_longitude"] == 0)
]

zero_deliveries = df_test[
    (df_test["Delivery_location_latitude"] == 0) |
    (df_test["Delivery_location_longitude"] == 0)
]

print("Restaurants with zero coordinates:", len(zero_restaurants))

print("Delivery locations with zero coordinates:", len(zero_deliveries))

print("\nRecords with zero restaurant coordinates:")

print(
    zero_restaurants[
        [
            "Restaurant_latitude",
            "Restaurant_longitude",
            "Delivery_location_latitude",
            "Delivery_location_longitude",
            "City"
        ]
    ].head(10).to_string(index=False)
)

print("\nZERO COORDINATE RECORD ANALYSIS")
print("-" * 50)

print("Average Delivery Time:")

print(
    zero_restaurants["Time_taken (min)"].mean()
)

print("\nDelivery Time Statistics:")

print(
    zero_restaurants["Time_taken (min)"].describe()
)

print("\nCity Distribution:")

print(
    zero_restaurants["City"].value_counts()
)

print("\nWeather Distribution:")

print(
    zero_restaurants["Weather_conditions"].value_counts()
)

print("\nNEGATIVE COORDINATE ANALYSIS")
print("-" * 50)

negative_records = df[
    (df["Restaurant_latitude"] < 0) |
    (df["Restaurant_longitude"] < 0)
].copy()

print("Total negative coordinate records:", len(negative_records))

print("\nOriginal coordinates:")

print(
    negative_records[
        [
            "Restaurant_latitude",
            "Restaurant_longitude",
            "Delivery_location_latitude",
            "Delivery_location_longitude",
            "City"
        ]
    ].head(20).to_string(index=False)
)

print("\nNegative latitude and longitude combinations:")

print(
    negative_records.assign(
        Negative_Latitude=negative_records["Restaurant_latitude"] < 0,
        Negative_Longitude=negative_records["Restaurant_longitude"] < 0
    ).groupby(
        ["Negative_Latitude", "Negative_Longitude"]
    ).size()
)

print("\nAPPLYING COORDINATE CLEANING")
print("-" * 50)

# Create working cleaned dataset
df_clean = df.copy()

# Correct negative restaurant coordinates
df_clean["Restaurant_latitude"] = (
    df_clean["Restaurant_latitude"].abs()
)

df_clean["Restaurant_longitude"] = (
    df_clean["Restaurant_longitude"].abs()
)

# Identify records with invalid restaurant coordinates
invalid_location = (
    (df_clean["Restaurant_latitude"] == 0) &
    (df_clean["Restaurant_longitude"] == 0)
)

# Mark all coordinates as missing for invalid location records
coordinate_columns = [
    "Restaurant_latitude",
    "Restaurant_longitude",
    "Delivery_location_latitude",
    "Delivery_location_longitude"
]

df_clean.loc[
    invalid_location,
    coordinate_columns
] = np.nan

print("\nInvalid Location Records:", invalid_location.sum())

print("\nMissing Coordinate Values:")
print(df_clean[coordinate_columns].isnull().sum())

print("Original records:", len(df))
print("Cleaned records:", len(df_clean))

print("\nMissing restaurant coordinates after cleaning:")

print(
    df_clean[
        ["Restaurant_latitude", "Restaurant_longitude"]
    ].isnull().sum()
)

print("\nRemaining negative restaurant coordinates:")

print(
    (df_clean["Restaurant_latitude"] < 0).sum()
)

print("\nCALCULATING DELIVERY DISTANCE")
print("-" * 50)

def calculate_distance(lat1, lon1, lat2, lon2):

    earth_radius = 6371

    lat1 = np.radians(lat1)
    lon1 = np.radians(lon1)

    lat2 = np.radians(lat2)
    lon2 = np.radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        np.sin(dlat / 2) ** 2
        + np.cos(lat1) * np.cos(lat2)
        * np.sin(dlon / 2) ** 2
    )

    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))

    return earth_radius * c


df_clean["Delivery_Distance_km"] = calculate_distance(
    df_clean["Restaurant_latitude"],
    df_clean["Restaurant_longitude"],
    df_clean["Delivery_location_latitude"],
    df_clean["Delivery_location_longitude"]
)

print("Distance calculation completed!")

print("\nDistance Statistics:")
print(df_clean["Delivery_Distance_km"].describe())

print("\nMissing Distance Values:")
print(df_clean["Delivery_Distance_km"].isnull().sum())

print("\nMISSING VALUE ANALYSIS")
print("-" * 50)

missing_count = df_clean.isnull().sum()

missing_percentage = (
    df_clean.isnull().mean() * 100
).round(2)

missing_analysis = pd.DataFrame({
    "Missing Values": missing_count,
    "Percentage": missing_percentage
})

print(
    missing_analysis[
        missing_analysis["Missing Values"] > 0
    ]
)

print("\nINVALID RATING INVESTIGATION")
print("-" * 50)

print("Rating values:")
print(df_clean["Delivery_person_Ratings"].value_counts().sort_index())

print("\nRatings above 5:")
print(
    df_clean[
        df_clean["Delivery_person_Ratings"] > 5
    ].shape[0]
)

print("\nRatings below 1:")
print(
    df_clean[
        df_clean["Delivery_person_Ratings"] < 1
    ].shape[0]
)

print("\nCLEANING INVALID DELIVERY RATINGS")
print("-" * 50)

# Replace ratings above 5 with missing values
df_clean.loc[
    df_clean["Delivery_person_Ratings"] > 5,
    "Delivery_person_Ratings"
] = np.nan

print("Invalid ratings replaced:", 53)

print(
    "Remaining ratings above 5:",
    (df_clean["Delivery_person_Ratings"] > 5).sum()
)

print(
    "Total missing ratings now:",
    df_clean["Delivery_person_Ratings"].isnull().sum()
)

print("\nDELIVERY PERSON AGE INVESTIGATION")
print("-" * 50)

print("Age Statistics:")
print(df_clean["Delivery_person_Age"].describe())

print("\nUnique Age Values:")
print(
    sorted(
        df_clean["Delivery_person_Age"]
        .dropna()
        .unique()
    )
)

print("\nAges below 18:")
print(
    (df_clean["Delivery_person_Age"] < 18).sum()
)

print("\nAges above 60:")
print(
    (df_clean["Delivery_person_Age"] > 60).sum()
)

print("\nCLEANING INVALID DELIVERY PERSON AGES")
print("-" * 50)

# Replace ages below 18 with missing values
df_clean.loc[
    df_clean["Delivery_person_Age"] < 18,
    "Delivery_person_Age"
] = np.nan

print(
    "Remaining ages below 18:",
    (df_clean["Delivery_person_Age"] < 18).sum()
)

print(
    "Total missing age values:",
    df_clean["Delivery_person_Age"].isnull().sum()
)

print("\nMULTIPLE DELIVERIES INVESTIGATION")
print("-" * 50)

print("Value Counts:")
print(df_clean["multiple_deliveries"].value_counts(dropna=False).sort_index())

print("\nValues below 0:")
print((df_clean["multiple_deliveries"] < 0).sum())

print("\nValues above 3:")
print((df_clean["multiple_deliveries"] > 3).sum())

print("\nVEHICLE CONDITION INVESTIGATION")
print("-" * 50)

print("Vehicle Condition Counts:")
print(df_clean["Vehicle_condition"].value_counts(dropna=False).sort_index())

print("\nValues below 0:")
print((df_clean["Vehicle_condition"] < 0).sum())

print("\nValues above 3:")
print((df_clean["Vehicle_condition"] > 3).sum())

print("\nVehicle Condition by Vehicle Type:")
print(pd.crosstab(
    df_clean["Vehicle_condition"],
    df_clean["Type_of_vehicle"]
))

print("\nCATEGORICAL VALUE INVESTIGATION")
print("-" * 50)

categorical_columns = [
    "Weather_conditions",
    "Road_traffic_density",
    "Type_of_order",
    "Type_of_vehicle",
    "Festival",
    "City"
]

for column in categorical_columns:
    print(f"\n{column}:")
    print(df_clean[column].value_counts(dropna=False))

    print("\nCLEANING CATEGORICAL TEXT VALUES")
print("-" * 50)

categorical_columns = [
    "Weather_conditions",
    "Road_traffic_density",
    "Type_of_order",
    "Type_of_vehicle",
    "Festival",
    "City"
]

for column in categorical_columns:

    # Remove unwanted spaces
    df_clean[column] = (
        df_clean[column]
        .astype("string")
        .str.strip()
    )

    print(f"\n{column}:")
    print(df_clean[column].value_counts(dropna=False))
    
print("\nCategorical text cleaning completed!")

print("\nTARGET VARIABLE INVESTIGATION")
print("-" * 50)

target = "Time_taken (min)"

print("\nMissing target values:")
print(df_clean[target].isnull().sum())

print("\nDelivery Time Statistics:")
print(df_clean[target].describe())

print("\nUnique delivery time values:")
print(sorted(df_clean[target].unique()))

print("\nDelivery times below 10 minutes:")
print((df_clean[target] < 10).sum())

print("\nDelivery times above 60 minutes:")
print((df_clean[target] > 60).sum())

print("\nTarget investigation completed!")

print("\nOUTLIER DETECTION USING IQR")
print("-" * 50)

numerical_columns = [
    "Delivery_person_Age",
    "Delivery_person_Ratings",
    "Delivery_Distance_km",
    "Time_taken (min)"
]

for column in numerical_columns:

    Q1 = df_clean[column].quantile(0.25)
    Q3 = df_clean[column].quantile(0.75)

    IQR = Q3 - Q1

    lower_limit = Q1 - 1.5 * IQR
    upper_limit = Q3 + 1.5 * IQR

    outliers = df_clean[
        (df_clean[column] < lower_limit) |
        (df_clean[column] > upper_limit)
    ]

    print(f"\nColumn: {column}")
    print("Lower Limit:", round(lower_limit, 2))
    print("Upper Limit:", round(upper_limit, 2))
    print("Outlier Count:", len(outliers))

print("\nOUTLIER DETECTION COMPLETED!")

print("\nINSPECTING DELIVERY TIME OUTLIERS")
print("-" * 50)

delivery_time_outliers = df_clean[
    df_clean["Time_taken (min)"] > 51.5
]

print("Number of records:", len(delivery_time_outliers))

print(
    delivery_time_outliers[
        [
            "Delivery_person_Age",
            "Delivery_person_Ratings",
            "Weather_conditions",
            "Road_traffic_density",
            "multiple_deliveries",
            "City",
            "Time_taken (min)"
        ]
    ].head(10)
)

print("\nINSPECTING RATING OUTLIERS")
print("-" * 50)

rating_outliers = df_clean[
    df_clean["Delivery_person_Ratings"] < 3.9
]

print("Number of records:", len(rating_outliers))

print(
    rating_outliers[
        [
            "Delivery_person_Age",
            "Delivery_person_Ratings",
            "Weather_conditions",
            "Road_traffic_density",
            "multiple_deliveries",
            "City",
            "Time_taken (min)"
        ]
    ].head(10)
)

print("\nFINAL MISSING VALUE CHECK")
print("-" * 50)

missing_count = df_clean.isnull().sum()

missing_percentage = (
    df_clean.isnull().mean() * 100
).round(2)

missing_summary = pd.DataFrame({
    "Missing Values": missing_count,
    "Missing Percentage": missing_percentage
})

print(
    missing_summary[
        missing_summary["Missing Values"] > 0
    ]
)

print("\nFinal Dataset Shape:", df_clean.shape)

print("\nORDER TIME MISSING VALUE INVESTIGATION")
print("-" * 50)

print(
    "Missing order times:",
    df_clean["Time_Orderd"].isnull().sum()
)

print(
    "Missing pickup times:",
    df_clean["Time_Order_picked"].isnull().sum()
)

print("\nSample records with missing order times:")

print(
    df_clean[
        df_clean["Time_Orderd"].isnull()
    ][
        [
            "Time_Orderd",
            "Time_Order_picked",
            "Time_taken (min)",
            "City"
        ]
    ].head(10)
)

print("\nORDER DATE INVESTIGATION")
print("-" * 50)

print("Missing order dates:", df_clean["Order_Date"].isnull().sum())

print("\nOrder date data type:")
print(df_clean["Order_Date"].dtype)

print("\nSample order dates:")
print(df_clean["Order_Date"].head(10))

print("\nUnique order dates:")
print(df_clean["Order_Date"].nunique())

print("\nCONVERTING ORDER DATE")
print("-" * 50)

df_clean["Order_Date"] = pd.to_datetime(
    df_clean["Order_Date"],
    format="%d-%m-%Y",
    errors="coerce"
)

print("New data type:")
print(df_clean["Order_Date"].dtype)

print("\nSample converted dates:")
print(df_clean["Order_Date"].head(10))

print("\nMissing dates after conversion:")
print(df_clean["Order_Date"].isnull().sum())

print("\nCREATING DATE FEATURES")
print("-" * 50)

df_clean["Order_Day"] = df_clean["Order_Date"].dt.day_name()

df_clean["Order_Month"] = df_clean["Order_Date"].dt.month

# Create weekend feature
df_clean["Is_Weekend"] = (
    df_clean["Order_Date"].dt.day_of_week >= 5
)

print("\nWeekend Distribution:")
print(df_clean["Is_Weekend"].value_counts())

print("\nOrder Day:")
print(df_clean["Order_Day"].value_counts())

print("\nOrder Month:")
print(df_clean["Order_Month"].value_counts())

print("\nDate features created successfully!")

print("\nCREATING TIME-BASED FEATURES")
print("-" * 50)

# Convert order and pickup times into datetime

def convert_time_value(value):

    if pd.isna(value):
        return pd.NaT

    value = str(value).strip()

    # Handle fractional day values
    try:
        number = float(value)

        if number == 1:
            return pd.NaT

        if 0 <= number < 1:

            total_minutes = round(number * 24 * 60)

            return pd.to_datetime(
                f"{total_minutes // 60:02d}:{total_minutes % 60:02d}",
                format="%H:%M",
                errors="coerce"
            )

    except ValueError:
        pass

    # Handle normal time formats
    for time_format in ("%H:%M", "%H:%M:%S"):

        parsed_time = pd.to_datetime(
            value,
            format=time_format,
            errors="coerce"
        )

        if not pd.isna(parsed_time):
            return parsed_time

    return pd.NaT


# Convert order time
df_clean["Order_Time"] = df_clean["Time_Orderd"].apply(
    convert_time_value
)

# Convert pickup time
df_clean["Pickup_Time"] = df_clean["Time_Order_picked"].apply(
    convert_time_value
)

# Extract order hour
df_clean["Order_Hour"] = df_clean["Order_Time"].dt.hour

# Extract pickup hour
df_clean["Pickup_Hour"] = df_clean["Pickup_Time"].dt.hour

# Calculate restaurant preparation time
df_clean["Preparation_Time"] = (
    df_clean["Pickup_Time"] - df_clean["Order_Time"]
).dt.total_seconds() / 60

# Correct times crossing midnight
df_clean.loc[
    df_clean["Preparation_Time"] < 0,
    "Preparation_Time"
] += 24 * 60

print("\nOrder Hour Distribution:")
print(df_clean["Order_Hour"].value_counts().sort_index())

print("\nPickup Hour Distribution:")
print(df_clean["Pickup_Hour"].value_counts().sort_index())

print("\nPreparation Time Statistics:")
print(df_clean["Preparation_Time"].describe())

print("\nMissing Preparation Times:")
print(df_clean["Preparation_Time"].isnull().sum())

print("\nTime-based features created successfully!")

print("\nCREATING DELIVERY TIME CATEGORIES")
print("-" * 50)

def classify_delivery_time(minutes):

    if minutes <= 20:
        return "Fast"

    elif minutes <= 30:
        return "Normal"

    elif minutes <= 40:
        return "Slow"

    else:
        return "Very Slow"


# Create delivery time category
df_clean["Delivery_Category"] = (
    df_clean["Time_taken (min)"].apply(classify_delivery_time)
)

# Display category distribution
print("\nDelivery Category Distribution:")
print(df_clean["Delivery_Category"].value_counts())

# Calculate percentage
print("\nDelivery Category Percentage:")
print(
    df_clean["Delivery_Category"]
    .value_counts(normalize=True)
    .mul(100)
    .round(2)
)

print("\nDelivery Time Classification Completed!")

print("\nCREATING TRAFFIC PERIOD FEATURE")
print("-" * 50)

def classify_traffic_period(hour):

    if pd.isna(hour):
        return "Unknown"

    elif 5 <= hour <= 11:
        return "Morning"

    elif 12 <= hour <= 15:
        return "Afternoon"

    elif 16 <= hour <= 20:
        return "Evening"

    else:
        return "Night"


# Create traffic period feature
df_clean["Traffic_Period"] = (
    df_clean["Order_Hour"].apply(classify_traffic_period)
)

# Display distribution
print("\nTraffic Period Distribution:")
print(df_clean["Traffic_Period"].value_counts())

# Calculate percentages
print("\nTraffic Period Percentage:")
print(
    df_clean["Traffic_Period"]
    .value_counts(normalize=True)
    .mul(100)
    .round(2)
)

print("\nTraffic Period Feature Created Successfully!")

print("\nINVESTIGATING UNKNOWN TRAFFIC PERIODS")
print("-" * 50)

# Count missing order hours
print("\nMissing Order_Hour values:")
print(df_clean["Order_Hour"].isna().sum())

# Count missing original order times
print("\nMissing Time_Orderd values:")
print(df_clean["Time_Orderd"].isna().sum())

# Find records where original order time exists
# but Order_Hour is missing
unknown_records = df_clean[
    df_clean["Order_Hour"].isna() &
    df_clean["Time_Orderd"].notna()
]

print("\nRecords with Order Time but Missing Order Hour:")
print(len(unknown_records))

# Display sample records
print("\nSample Records:")
print(
    unknown_records[
        ["Time_Orderd", "Order_Hour", "Time_Order_picked"]
    ].head(20)
)

# Display unique original time values
print("\nUnique Time_Orderd Values (Sample):")
print(df_clean["Time_Orderd"].dropna().unique()[:30])

print("\nUnique values causing missing Order_Hour:")

print(
    df_clean.loc[
        df_clean["Order_Hour"].isnull()
        & df_clean["Time_Orderd"].notnull(),
        "Time_Orderd"
    ].value_counts()
)

print("\nFINAL TIME CLEANING VERIFICATION")
print("-" * 50)

print("Missing converted order times:")
print(df_clean["Order_Time"].isna().sum())

print("\nMissing converted pickup times:")
print(df_clean["Pickup_Time"].isna().sum())

print("\nMissing preparation times:")
print(df_clean["Preparation_Time"].isna().sum())

print("\nInvalid original pickup time values:")
print(
    df_clean.loc[
        df_clean["Pickup_Time"].isna(),
        "Time_Order_picked"
    ].value_counts().head(10)
)

print("\nPREPARING FINAL MACHINE LEARNING DATASET")
print("-" * 50)

# Select input features
model_features = [
    "Delivery_person_Age",
    "Delivery_person_Ratings",
    "Delivery_Distance_km",
    "Weather_conditions",
    "Road_traffic_density",
    "Vehicle_condition",
    "Type_of_order",
    "Type_of_vehicle",
    "multiple_deliveries",
    "Festival",
    "City",
    "Order_Hour",
    "Order_Month",
    "Is_Weekend"
]

# Define prediction target
target = "Time_taken (min)"

# Create final modelling dataset
model_df = df_clean[model_features + [target]].copy()

# Create output folder
from pathlib import Path

Path("processed").mkdir(parents=True, exist_ok=True)

# Save cleaned dataset
model_df.to_csv(
    "processed/cleaned_delivery_data.csv",
    index=False
)

print("Final Dataset Shape:", model_df.shape)

print("\nSelected Features:")
print(model_features)

print("\nTarget Variable:", target)

print("\nMissing Values:")
print(model_df.isnull().sum())

print("\nFinal dataset saved successfully!")