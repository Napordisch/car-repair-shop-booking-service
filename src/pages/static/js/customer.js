export class Customer {
    id;
    email;
    phoneNumber;
    firstName;
    lastName;
    constructor (id, phoneNumber, firstName, lastName, email) {
        if (id != null) {
            this.id = id;
        }
        if (email != null) {
            this.email = email;
        }
        if (phoneNumber != null) {
            this.phoneNumber = phoneNumber;
        }
        if (firstName != null) {
            this.firstName = firstName;
        }
        if (firstName != null) {
            this.lastName = lastName;
        }
    }
    static fromJSON(customerJSON) {
        let customerInstance;
        if (typeof customerJSON == "string") {
            customerInstance = JSON.parse(customerJSON);
        } else if (typeof customerJSON == "object") {
            customerInstance = customerJSON;
        }
        return new Customer(customerInstance.id,
                            customerInstance.phoneNumber,
                            customerInstance.firstName,
                            customerInstance.lastName,
                            customerInstance.email)
    }
}