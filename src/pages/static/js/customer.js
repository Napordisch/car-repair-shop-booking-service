export class Customer {
    id;
    email;
    phoneNumber;
    firstName;
    lastName;
    Customer(id, phoneNumber, firstName, lastName, email) {
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
        if (typeof customerInstance === "string") {
            customerInstance = JSON.parse(customerJSON);
        } else if (typeof customerInstance === "object") {
            customerInstance = customerJSON;
        }
        return new Customer(customerInstance.id,
                            customerInstance.phoneNumber,
                            customerInstance.firstName,
                            customerInstance.lastName,
                            customerInstance.email)
    }
}