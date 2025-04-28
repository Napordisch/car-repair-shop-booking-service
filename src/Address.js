import isMobilePhoneModule from 'validator/lib/isMobilePhone.js'
import isEmailModule from 'validator/lib/isEmail.js'
import {AbstractClassInstantiationError, AddressError} from "./errors.js";
const isMobilePhone = isMobilePhoneModule.default || isMobilePhoneModule;
const isEmail = isEmailModule.default || isEmailModule;

export const addressType = Object.freeze({
    EMAIL: "email",
    PHONE: "phoneNumber"
});

export class Address {
    value;
    type;

    constructor(address) {
        if (new.target === Address) {
            throw new AbstractClassInstantiationError("Cannot instantiate an abstract class.");
        }
        this.value = address;
    }

    static create(address) {
        // Automatically choose the correct subclass
        if (isMobilePhone(address, 'ru-RU')) {
            return new PhoneNumber(address);
        } else if (isEmail(address)) {
            return new Email(address);
        } else {
            throw new AddressError('Unsupported address');
        }
    }
}

export class Email extends Address {
    value;
    type = addressType.EMAIL;

    constructor(address) {
        super(address);
    }
}

export class PhoneNumber extends Address {
    value;
    type = addressType.PHONE;

    constructor(address) {
        super(address);
    }
}