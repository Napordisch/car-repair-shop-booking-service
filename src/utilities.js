import isMobilePhoneModule from 'validator/lib/isMobilePhone.js'
const isMobilePhone = isMobilePhoneModule.default || isMobilePhoneModule;
import isEmailModule from 'validator/lib/isEmail.js'
const isEmail = isEmailModule.default || isEmailModule;

class AddressError extends Error {
    constructor(message) {
        super(message);
        this.name = "AddressError";
    }
}

const addressType = Object.freeze({
    EMAIL: 1,
    PHONE: 2,
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

export {Address, addressType, AddressError, getAddress};