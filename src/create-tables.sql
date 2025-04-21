-- Create Customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS Customers (
    id TEXT PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT,
    phoneNumber TEXT NOT NULL UNIQUE,
    email TEXT
);

-- Create Services table if it doesn't exist
CREATE TABLE IF NOT EXISTS Services (
    id TEXT PRIMARY KEY,
    price INTEGER NOT NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    duration INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT 1
);

-- Create Orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Orders" (
    id TEXT PRIMARY KEY,
    deadline DATE NOT NULL,
    initialVisit DATE NOT NULL,
    customerID TEXT NOT NULL,
    services TEXT NOT NULL
);

-- Create ParkingSpaces table if it doesn't exist
CREATE TABLE IF NOT EXISTS ParkingSpaces (
    number INTEGER PRIMARY KEY,
    registrationNumber TEXT,
    occupied BOOLEAN NOT NULL DEFAULT 0,
    orderID TEXT
);

