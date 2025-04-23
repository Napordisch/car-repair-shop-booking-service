import isMobilePhoneModule from 'validator/lib/isMobilePhone.js'
const isMobilePhone = isMobilePhoneModule.default || isMobilePhoneModule;
import isEmailModule from 'validator/lib/isEmail.js'
const isEmail = isEmailModule.default || isEmailModule;

import pkg from "cookie-parser"
const {cookieParser} = pkg;
import jwt from 'jsonwebtoken';

import {AddressError, MissingDataError} from "./errors.js";

const addressType = Object.freeze({
    EMAIL: "email",
    PHONE: "phoneNumber"
});

class Address {
    value;
    type;
    constructor(address) {
        this.value = address;
        this.type = this.determineType(this.value);
    }

    determineType(address) {
        let type;
        if (isMobilePhone(address, 'ru-RU')) {
            type = addressType.PHONE;
        } else if (isEmail(address)) {
            type = addressType.EMAIL;
        }

        else {
            throw new AddressError(`Unsupported address`);
        }
        return type;
    }
}

function getAddress(req, res) {
    try {
        return new Address(req.body.address);
    } catch (error) {
        console.error(error);
        if (error instanceof AddressError) {
            console.error(error);
            res.status(400);
            res.send(error.message);
            return null;
        }
        throw error;
    }
}

function setAuthToken(res, userId) {
    console.log(process.env.JWT_SECRET);
    const token = jwt.sign({ userId }, process.env.JWT_SECRET);

    res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        sameSite: 'strict',
        path: '/',
    });
}

function verifyAuthToken(req, res, next) {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.userId = decoded.userId;
        next();
    });
}

export {Address, addressType, getAddress, setAuthToken, verifyAuthToken};
