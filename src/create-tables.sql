-- Create Customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS Customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    phoneNumber TEXT,
    email TEXT
);

-- Create Services table if it doesn't exist
CREATE TABLE IF NOT EXISTS Services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price INTEGER NOT NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    duration INTEGER NOT NULL, -- milliseconds
    active BOOLEAN NOT NULL DEFAULT 1
);

-- Create Orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Orders" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deadline DATE NOT NULL,
    initialVisit DATE NOT NULL,
    customerID INTEGER NOT NULL,
    FOREIGN KEY (customerID) REFERENCES Customers(id)
);

-- Create ParkingSpaces table if it doesn't exist
CREATE TABLE IF NOT EXISTS ParkingSpaces (
    number INTEGER PRIMARY KEY,
    registrationNumber TEXT,
    occupied BOOLEAN NOT NULL DEFAULT 0,
    orderID TEXT,
    FOREIGN KEY (orderID) REFERENCES "Orders"(id)
);

CREATE TABLE IF NOT EXISTS OrderServices (
    orderID INTEGER NOT NULL,
    serviceID INTEGER NOT NULL,
    PRIMARY KEY (orderID, serviceID),
    FOREIGN KEY (orderID) REFERENCES "Orders"(id),
    FOREIGN KEY (serviceID) REFERENCES Services(id)
);

CREATE TABLE IF NOT EXISTS ConfirmationCodes (
    address TEXT NOT NULL,
    code TEXT NOT NULL
);
