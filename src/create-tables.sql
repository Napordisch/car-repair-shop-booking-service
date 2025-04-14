CREATE TABLE IF NOT EXISTS Customers (
    id TEXT PRIMARY KEY,                           -- UUID as TEXT; generate externally
    firstName TEXT NOT NULL,                        -- required field
    lastName TEXT,                                  -- optional field
    phoneNumber TEXT NOT NULL UNIQUE,               -- unique phone number
    email TEXT                                      -- optional field
);

CREATE TABLE IF NOT EXISTS Services (
    id TEXT PRIMARY KEY,                           -- UUID as TEXT; generate externally
    price INTEGER NOT NULL,                         -- price in smallest currency unit (e.g., cents)
    name TEXT NOT NULL UNIQUE,                      -- unique service name
    description TEXT                                -- optional descriptive text
);

CREATE TABLE IF NOT EXISTS "Orders" (
    id TEXT PRIMARY KEY,                           -- UUID as TEXT; generate externally
    deadline DATE NOT NULL,                         -- deadline date for the order
    initialVisit DATE NOT NULL                      -- initial visit date for the order
);

CREATE TABLE IF NOT EXISTS ParkingSpaces (
    number INTEGER PRIMARY KEY,                    -- unique parking space number
    registrationNumber TEXT NOT NULL,               -- vehicle registration number (or similar)
    occupied BOOLEAN NOT NULL DEFAULT 0,            -- 0 (false) by default, use 1 for true
    orderID TEXT NOT NULL,                          -- reference to the Order table
    FOREIGN KEY (orderID) REFERENCES "Order"(id)    -- foreign key constraint to ensure referential integrity
);
