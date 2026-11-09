from database import engine

try:
    with engine.connect() as connection:
        print("SUCCESS! PostgreSQL connected to DeliveryAI!")
        print("Database connection is working.")

except Exception as error:
    print("DATABASE CONNECTION FAILED!")
    print(error)