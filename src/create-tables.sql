CREATE TABLE IF NOT EXISTS Customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    phoneNumber TEXT,
    email TEXT
);

CREATE TABLE IF NOT EXISTS Services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price INTEGER NOT NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    duration INTEGER NOT NULL, -- milliseconds
    active BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "Orders" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deadline TEXT NOT NULL,
    initialVisit TEXT NOT NULL,
    customerID INTEGER NOT NULL,
    parkingSpace INTEGER NOT NULL,
    FOREIGN KEY (customerID) REFERENCES Customers(id),
    FOREIGN KEY (parkingSpace) REFERENCES ParkingSpaces(number)
);

CREATE TABLE IF NOT EXISTS ParkingSpaces (
    number INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS OrderServices (
    orderID INTEGER NOT NULL,
    serviceID INTEGER NOT NULL,
    FOREIGN KEY (orderID) REFERENCES "Orders"(id),
    FOREIGN KEY (serviceID) REFERENCES Services(id)
);

CREATE TABLE IF NOT EXISTS ConfirmationCodes (
    address TEXT NOT NULL,
    code TEXT NOT NULL
);
