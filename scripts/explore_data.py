import pandas as pd

# Load the Zomato dataset
file_path = "dataset/Zomato Dataset.csv"
df = pd.read_csv(file_path)

# Display basic dataset information
print("DATASET LOADED SUCCESSFULLY!")
print("-" * 50)

print("Dataset Shape:", df.shape)

print("\nFirst 5 Rows:")
print(df.head())

print("\nColumn Names:")
print(df.columns.tolist())

print("\nDataset Information:")
df.info()

print("\nMissing Values:")
print(df.isnull().sum())

print("\nDuplicate Records:")
print(df.duplicated().sum())

print("\nDelivery Time Statistics:")
print(df["Time_taken (min)"].describe())

print("\nDelivery Time Range:")
print("Minimum:", df["Time_taken (min)"].min(), "minutes")
print("Maximum:", df["Time_taken (min)"].max(), "minutes")
print("Average:", df["Time_taken (min)"].mean(), "minutes")

import matplotlib.pyplot as plt

plt.figure(figsize=(10, 5))

plt.hist(df["Time_taken (min)"], bins=20, edgecolor="black")

plt.title("Food Delivery Time Distribution")
plt.xlabel("Delivery Time (Minutes)")
plt.ylabel("Number of Orders")

plt.grid(axis="y", alpha=0.3)
plt.show()

# Average delivery time based on weather conditions

weather_analysis = df.groupby("Weather_conditions")["Time_taken (min)"].mean()

print("\nAverage Delivery Time by Weather:")
print(weather_analysis)

# Visualisation
plt.figure(figsize=(10, 5))

weather_analysis.plot(kind="bar", edgecolor="black")

plt.title("Impact of Weather on Food Delivery Time")
plt.xlabel("Weather Conditions")
plt.ylabel("Average Delivery Time (Minutes)")

plt.xticks(rotation=45)
plt.grid(axis="y", alpha=0.3)
plt.tight_layout()
plt.show()

# Average delivery time based on road traffic density

traffic_analysis = df.groupby("Road_traffic_density")["Time_taken (min)"].mean()

print("\nAverage Delivery Time by Traffic Density:")
print(traffic_analysis)

# Visualisation
plt.figure(figsize=(10, 5))

traffic_analysis.plot(kind="bar", edgecolor="black")

plt.title("Impact of Road Traffic on Food Delivery Time")
plt.xlabel("Road Traffic Density")
plt.ylabel("Average Delivery Time (Minutes)")

plt.xticks(rotation=0)
plt.grid(axis="y", alpha=0.3)
plt.tight_layout()
plt.show()

# Average delivery time based on vehicle condition

vehicle_analysis = df.groupby("Vehicle_condition")["Time_taken (min)"].mean()

print("\nAverage Delivery Time by Vehicle Condition:")
print(vehicle_analysis)

# Visualisation
plt.figure(figsize=(10, 5))

vehicle_analysis.plot(kind="bar", edgecolor="black")

plt.title("Impact of Vehicle Condition on Delivery Time")
plt.xlabel("Vehicle Condition")
plt.ylabel("Average Delivery Time (Minutes)")

plt.xticks(rotation=0)
plt.grid(axis="y", alpha=0.3)
plt.tight_layout()
plt.show()

# Average delivery time based on multiple deliveries

multiple_analysis = df.groupby("multiple_deliveries")["Time_taken (min)"].mean()

print("\nAverage Delivery Time by Number of Multiple Deliveries:")
print(multiple_analysis)

# Visualisation
plt.figure(figsize=(10, 5))

multiple_analysis.plot(kind="bar", edgecolor="black")

plt.title("Impact of Multiple Deliveries on Delivery Time")
plt.xlabel("Number of Multiple Deliveries")
plt.ylabel("Average Delivery Time (Minutes)")

plt.xticks(rotation=0)
plt.grid(axis="y", alpha=0.3)
plt.tight_layout()
plt.show()

# Average delivery time based on delivery person ratings

rating_analysis = df.groupby("Delivery_person_Ratings")["Time_taken (min)"].mean()

print("\nAverage Delivery Time by Delivery Person Ratings:")
print(rating_analysis)

# Visualisation
plt.figure(figsize=(10, 5))

rating_analysis.plot(kind="bar", edgecolor="black")

plt.title("Impact of Delivery Person Ratings on Delivery Time")
plt.xlabel("Delivery Person Ratings")
plt.ylabel("Average Delivery Time (Minutes)")

plt.xticks(rotation=0)
plt.grid(axis="y", alpha=0.3)
plt.tight_layout()
plt.show()

import numpy as np

# Calculate distance using the Haversine formula

def calculate_distance(lat1, lon1, lat2, lon2):

    earth_radius = 6371  # Kilometres

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


# Create a new distance column

df["Delivery_Distance_km"] = calculate_distance(
    df["Restaurant_latitude"],
    df["Restaurant_longitude"],
    df["Delivery_location_latitude"],
    df["Delivery_location_longitude"]
)

print("\nDelivery Distance Statistics:")
print(df["Delivery_Distance_km"].describe())

# Identify abnormal delivery distances

print("\nDistance Outlier Analysis:")

print("Distances above 20 km:")
print((df["Delivery_Distance_km"] > 20).sum())

print("\nDistances above 50 km:")
print((df["Delivery_Distance_km"] > 50).sum())

print("\nDistances above 100 km:")
print((df["Delivery_Distance_km"] > 100).sum())

print("\nTop 10 Largest Delivery Distances:")
print(
    df.nlargest(10, "Delivery_Distance_km")[
        ["Delivery_Distance_km", "Time_taken (min)"]
    ]
)

# Investigate abnormal delivery coordinates

print("\nSuspicious Delivery Records:")

outliers = df[df["Delivery_Distance_km"] > 50]

print(
    outliers[
        [
            "Restaurant_latitude",
            "Restaurant_longitude",
            "Delivery_location_latitude",
            "Delivery_location_longitude",
            "City",
            "Delivery_Distance_km"
        ]
    ].head(15).to_string(index=False)
)

print("\nNumber of suspicious records:", len(outliers))

# Create a filtered dataset for distance analysis

df_distance_clean = df[
    df["Delivery_Distance_km"] <= 50
].copy()

print("\nClean Distance Analysis:")

print("Original records:", len(df))
print("Records after filtering:", len(df_distance_clean))
print("Removed records:", len(df) - len(df_distance_clean))

print("\nClean Distance Statistics:")
print(df_distance_clean["Delivery_Distance_km"].describe())

print("\nCOORDINATE SIGN ANALYSIS")

print("Negative restaurant latitudes:",
      (df["Restaurant_latitude"] < 0).sum())

print("Positive restaurant latitudes:",
      (df["Restaurant_latitude"] > 0).sum())

print("Negative delivery latitudes:",
      (df["Delivery_location_latitude"] < 0).sum())

print("Positive delivery latitudes:",
      (df["Delivery_location_latitude"] > 0).sum())

print("\nNEGATIVE RESTAURANT COORDINATES")

negative_coords = df[df["Restaurant_latitude"] < 0]

print(
    negative_coords[
        [
            "Restaurant_latitude",
            "Restaurant_longitude",
            "Delivery_location_latitude",
            "Delivery_location_longitude",
            "City"
        ]
    ].head(20).to_string(index=False)
)

print("\nRestaurant longitude statistics:")
print(df["Restaurant_longitude"].describe())

print("\nLONGITUDE SIGN ANALYSIS")

print("Negative restaurant longitudes:",
      (df["Restaurant_longitude"] < 0).sum())

print("Positive restaurant longitudes:",
      (df["Restaurant_longitude"] > 0).sum())

print("Negative delivery longitudes:",
      (df["Delivery_location_longitude"] < 0).sum())

print("Positive delivery longitudes:",
      (df["Delivery_location_longitude"] > 0).sum())

print("\nRecords containing negative coordinates:")

negative_records = df[
    (df["Restaurant_latitude"] < 0) |
    (df["Restaurant_longitude"] < 0) |
    (df["Delivery_location_latitude"] < 0) |
    (df["Delivery_location_longitude"] < 0)
]

print("Total affected records:", len(negative_records))

print(
    negative_records[
        [
            "Restaurant_latitude",
            "Restaurant_longitude",
            "Delivery_location_latitude",
            "Delivery_location_longitude",
            "City"
        ]
    ].head(10).to_string(index=False)
)

# TEST COORDINATE CORRECTION

df_test = df.copy()

# Correct negative restaurant coordinates in test copy
df_test["Restaurant_latitude"] = (
    df_test["Restaurant_latitude"].abs()
)

df_test["Restaurant_longitude"] = (
    df_test["Restaurant_longitude"].abs()
)

# Recalculate delivery distance
df_test["Test_Distance_km"] = calculate_distance(
    df_test["Restaurant_latitude"],
    df_test["Restaurant_longitude"],
    df_test["Delivery_location_latitude"],
    df_test["Delivery_location_longitude"]
)

print("\nCOORDINATE CORRECTION TEST")

print("Original maximum distance:",
      df["Delivery_Distance_km"].max())

print("Corrected maximum distance:",
      df_test["Test_Distance_km"].max())

print("Corrected distances above 50 km:",
      (df_test["Test_Distance_km"] > 50).sum())

print("Corrected distances above 20 km:",
      (df_test["Test_Distance_km"] > 20).sum())

print("\nCorrected Distance Statistics:")
print(df_test["Test_Distance_km"].describe())

print("\nREMAINING DISTANCE OUTLIERS AFTER CORRECTION")

remaining_outliers = df_test[
    df_test["Test_Distance_km"] > 20
]

print("Records above 20 km:",
      len(remaining_outliers))

print("\nTop 15 largest corrected distances:")

print(
    remaining_outliers.nlargest(
        15, "Test_Distance_km"
    )[
        [
            "Test_Distance_km",
            "Restaurant_latitude",
            "Restaurant_longitude",
            "Delivery_location_latitude",
            "Delivery_location_longitude",
            "City",
            "Time_taken (min)"
        ]
    ].to_string(index=False)
)
print("\nDELIVERY DISTANCE RANGE ANALYSIS")

print("0–5 km:",
      ((df_test["Test_Distance_km"] >= 0) &
       (df_test["Test_Distance_km"] <= 5)).sum())

print("5–10 km:",
      ((df_test["Test_Distance_km"] > 5) &
       (df_test["Test_Distance_km"] <= 10)).sum())

print("10–15 km:",
      ((df_test["Test_Distance_km"] > 10) &
       (df_test["Test_Distance_km"] <= 15)).sum())

print("15–20 km:",
      ((df_test["Test_Distance_km"] > 15) &
       (df_test["Test_Distance_km"] <= 20)).sum())

print("Above 20 km:",
      (df_test["Test_Distance_km"] > 20).sum())

print("\nAVERAGE DELIVERY TIME BY DISTANCE RANGE")

df_test["Distance_Range"] = pd.cut(
    df_test["Test_Distance_km"],
    bins=[0, 5, 10, 15, 20, 100],
    labels=["0-5 km", "5-10 km", "10-15 km",
            "15-20 km", "Above 20 km"]
)

print(
    df_test.groupby(
        "Distance_Range",
        observed=False
    )["Time_taken (min)"].agg(
        ["count", "mean", "min", "max"]
    )
)

print("\nMISSING VALUE PERCENTAGE")

missing_percentage = (
    df.isnull().sum() / len(df)
) * 100

print(missing_percentage[missing_percentage > 0])

print("\nINVALID VALUE ANALYSIS")

print("\nDelivery Person Age:")
print(df["Delivery_person_Age"].describe())

print("\nDelivery Person Ratings:")
print(df["Delivery_person_Ratings"].describe())

print("\nMultiple Deliveries:")
print(df["multiple_deliveries"].value_counts(dropna=False).sort_index())

print("\nVehicle Condition:")
print(df["Vehicle_condition"].value_counts().sort_index())

print("\nRATING VALIDATION")

invalid_ratings = df[
    (df["Delivery_person_Ratings"] < 1) |
    (df["Delivery_person_Ratings"] > 5)
]

print("Invalid rating records:", len(invalid_ratings))

print("\nInvalid Rating Values:")
print(invalid_ratings["Delivery_person_Ratings"].value_counts())


print("\nVEHICLE CONDITION VALIDATION")

print("Vehicle condition values:")
print(df["Vehicle_condition"].unique())

print("\nRecords with vehicle condition 3:")

print(
    df[df["Vehicle_condition"] == 3][
        ["Vehicle_condition", "Time_taken (min)", "City"]
    ].head(10)
)

print("\nVEHICLE CONDITION ANALYSIS")

print("\nAverage Delivery Time:")
print(
    df.groupby("Vehicle_condition")["Time_taken (min)"]
    .agg(["count", "mean", "median"])
)

print("\nVehicle Condition vs Vehicle Type:")
print(
    pd.crosstab(
        df["Vehicle_condition"],
        df["Type_of_vehicle"]
    )
)

print("\nVehicle Condition vs Delivery Ratings:")
print(
    df.groupby("Vehicle_condition")["Delivery_person_Ratings"]
    .mean()
)

print("\nORDER TIME ANALYSIS")

print("\nTime Ordered - First 20 Unique Values:")
print(df["Time_Orderd"].dropna().unique()[:20])

print("\nTime Order Picked - First 20 Unique Values:")
print(df["Time_Order_picked"].unique()[:20])

print("\nMissing Order Time Records:")
print(df["Time_Orderd"].isnull().sum())

print("\nMissing Order Time Examples:")
print(
    df[df["Time_Orderd"].isnull()][
        ["Time_Orderd", "Time_Order_picked", "Time_taken (min)"]
    ].head(10)
)

print("\nORDER PREPARATION TIME ANALYSIS")

# Convert order times into datetime format
df["Order_Time"] = pd.to_datetime(
    df["Time_Orderd"],
    format="%H:%M",
    errors="coerce"
)

df["Pickup_Time"] = pd.to_datetime(
    df["Time_Order_picked"],
    format="%H:%M",
    errors="coerce"
)

# Calculate preparation time in minutes
df["Preparation_Time"] = (
    df["Pickup_Time"] - df["Order_Time"]
).dt.total_seconds() / 60

# Handle orders crossing midnight
df.loc[
    df["Preparation_Time"] < 0,
    "Preparation_Time"
] += 24 * 60

print("\nPreparation Time Statistics:")
print(df["Preparation_Time"].describe())

print("\nNegative Preparation Times:")
print((df["Preparation_Time"] < 0).sum())

print("\nPreparation Time Examples:")
print(
    df[
        [
            "Time_Orderd",
            "Time_Order_picked",
            "Preparation_Time",
            "Time_taken (min)"
        ]
    ].head(15)
)

print("\nDELIVERY TIME BY ORDER HOUR")

# Extract order hour
df["Order_Hour"] = df["Order_Time"].dt.hour

# Calculate average delivery time
hour_analysis = (
    df.groupby("Order_Hour")["Time_taken (min)"]
    .agg(["count", "mean"])
    .round(2)
)

print(hour_analysis)

# Plot average delivery time by hour
import matplotlib.pyplot as plt

plt.figure(figsize=(10, 5))

hour_analysis["mean"].plot(
    kind="bar",
    title="Average Delivery Time by Order Hour"
)

plt.xlabel("Order Hour")
plt.ylabel("Average Delivery Time (Minutes)")
plt.xticks(rotation=0)
plt.tight_layout()
plt.show()

print("\nDELIVERY TIME BY DAY OF WEEK")

# Convert Order_Date into datetime
df["Order_Date_Formatted"] = pd.to_datetime(
    df["Order_Date"],
    dayfirst=True,
    errors="coerce"
)

# Extract day name
df["Day_of_Week"] = df["Order_Date_Formatted"].dt.day_name()

# Calculate average delivery time
day_analysis = (
    df.groupby("Day_of_Week")["Time_taken (min)"]
    .agg(["count", "mean"])
    .round(2)
)

print(day_analysis)