import database from './db.js';
import { v4 as uuidv4 } from 'uuid';
import * as validator from "validator";
import isMobilePhoneModule from 'validator/lib/isMobilePhone.js'
const isMobilePhone = isMobilePhoneModule.default || isMobilePhoneModule;
import isEmailModule from 'validator/lib/isEmail.js'
const isEmail = isEmailModule.default || isEmailModule;

export async function addCustomer(customerData) {
    // Check if required fields are present
    if (!customerData.firstName) {
        throw new Error('firstName is required');
    }
    if (!customerData.phoneNumber) {
        throw new Error('phoneNumber is required');
    }

    // Validate phone number format
    if (!isMobilePhone(customerData.phoneNumber)) {
        throw new Error('invalid phone number format');
    }

    // Validate email if provided
    if (customerData.email && !isEmail(customerData.email)) {
        throw new Error('invalid email format');
    }

    const { firstName, lastName, phoneNumber, email } = customerData;
    const id = uuidv4();
    
    try {
        await database.run(
            'INSERT INTO Customers (id, firstName, lastName, phoneNumber, email) VALUES (?, ?, ?, ?, ?)',
            [id, firstName, lastName || null, phoneNumber, email || null]
        );
        return { id };
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            throw new Error('phone number already exists');
        }
        throw error;
    }
} 